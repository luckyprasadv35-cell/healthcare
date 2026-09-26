import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { getSupabaseAdmin } from '../middlewares/authMiddleware';
import { GoogleGenAI } from '@google/genai';

export const chatWithCoach = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const supabaseAdmin = getSupabaseAdmin();
    const userId = req.user!.id;

    // Fetch user profile and active plan
    const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single();
    const { data: plan } = await supabaseAdmin.from('user_plans').select('*').eq('user_id', userId).eq('is_active', true).single();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are "Vitalis", a highly motivating and knowledgeable AI personal trainer. 
The user is asking a question. Use their profile and current active fitness/diet plan to give a personalized, short, and highly actionable answer.
Keep your response under 3 paragraphs. Be encouraging!

User Profile: ${JSON.stringify(profile)}
User Plan: ${JSON.stringify(plan)}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'Failed to chat with AI Coach', details: error.message });
  }
};
