import { GoogleGenAI } from '@google/genai';
import { ProfileInput } from '../schemas/profileSchema';
import { AIPlan, AIPlanSchema } from '../schemas/planSchema';

export async function generatePlan(profileData: ProfileInput, progressLogs: any[] = []): Promise<AIPlan> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('your_google_gemini_api_key') || apiKey.includes('YOUR_GEMINI')) {
    throw new Error('GEMINI_API_KEY is missing or invalid in Render environment variables. Please add a valid Google Gemini API Key.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `You are an elite, certified personal trainer and registered dietitian.
Your objective is to create strictly formatted, safe, and highly effective 7-day fitness and nutrition plans based on the user's biometrics, goals, constraints, and historical progress.
You MUST respond ONLY with valid raw JSON. Do not include markdown code block syntax like \`\`\`json in the output.`;

  const sanitizedNotes = (profileData.medical_notes || '').replace(/[`${}<>]/g, '').slice(0, 500);
  
  let historySection = 'No prior progress history available.';
  if (progressLogs && progressLogs.length > 0) {
    historySection = progressLogs.map(log => 
      `- Date: ${log.log_date}, Weight: ${log.weight_kg} kg, Notes: "${log.notes || 'None'}"`
    ).join('\n');
  }

  const userPrompt = `
Create a 7-day plan for a user with the following profile:
- Age: ${profileData.age}
- Weight: ${profileData.weight_kg} kg
- Height: ${profileData.height_cm} cm
- Gender: ${profileData.gender}
- Activity Level: ${profileData.activity_level}
- Goal: ${profileData.goal}
- Diet Preference: ${profileData.diet_preference}
- Equipment Available: ${profileData.equipment}
- Medical Notes / Constraints: ${sanitizedNotes || 'None'}

USER PROGRESS HISTORY (Recent Check-ins):
${historySection}

Please adjust the new plan considering their progress history (e.g., adjust calories/intensity if their weight trend is off-target, or address feedback in their notes).

Return ONLY a JSON object matching this exact structure:
{
  "macros": {
    "daily_calories": 2500,
    "protein_g": 180,
    "carbs_g": 250,
    "fats_g": 85
  },
  "workout_plan": [
    {
      "day": 1,
      "focus": "Upper Body Push",
      "exercises": [
        { "name": "Bench Press", "sets": 4, "reps": "8-10", "rest_sec": 90 }
      ]
    }
    ... (total 7 days, day 1 through 7)
  ],
  "nutrition_plan": [
    {
      "day": 1,
      "meals": [
        { "type": "Breakfast", "description": "Oatmeal with whey protein", "calories": 450 }
      ]
    }
    ... (total 7 days, day 1 through 7)
  ]
}`;

  const MODELS_TO_TRY = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-3.8-flash'];
  let lastError: Error | null = null;

  for (const model of MODELS_TO_TRY) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const prompt = attempt === 1 
          ? userPrompt 
          : `${userPrompt}\n\nIMPORTANT: Your previous output failed Zod schema validation. You MUST produce a JSON object with 'macros', 'workout_plan' (array of 7 days), and 'nutrition_plan' (array of 7 days). No markdown, no explanations outside JSON.`;

        console.log(`Attempting plan generation with model: ${model} (attempt ${attempt})`);
        
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.2,
          },
        });

        let text = response.text || '';
        text = text.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();

        const parsedJson = JSON.parse(text);
        const validatedPlan = AIPlanSchema.parse(parsedJson);

        return validatedPlan;
      } catch (error: any) {
        console.error(`Gemini model ${model} (attempt ${attempt}) failed:`, error?.message || error);
        lastError = error as Error;

        // If it's a 503 high demand or 404 model unavailable, break out of this model's attempts and try the next model immediately
        const errString = JSON.stringify(error || '');
        if (errString.includes('503') || errString.includes('UNAVAILABLE') || errString.includes('404') || errString.includes('NOT_FOUND')) {
          console.warn(`Model ${model} unavailable or overloaded. Switching to fallback model...`);
          break;
        }
      }
    }
  }

  throw new Error(`All AI model attempts failed. ${lastError?.message || ''}`);
}
