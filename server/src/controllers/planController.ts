import { Response } from 'express';
import { AuthenticatedRequest, supabaseAdmin } from '../middlewares/authMiddleware';
import { generatePlan as generateAiPlan } from '../services/geminiService';

export const generatePlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Fetch recent progress history
    const { data: progressLogs } = await supabaseAdmin
      .from('progress_logs')
      .select('weight_kg, notes, log_date')
      .eq('user_id', req.user.id)
      .order('log_date', { ascending: false })
      .limit(10);

    let planData;
    try {
      planData = await generateAiPlan(profile, progressLogs || []);
    } catch (aiError: any) {
      console.error('AI Generation error:', aiError);
      return res.status(503).json({ error: 'Failed to generate plan from AI service', details: aiError.message });
    }

    // Deactivate existing plans
    const { error: updateError } = await supabaseAdmin
      .from('user_plans')
      .update({ is_active: false })
      .eq('user_id', req.user.id)
      .eq('is_active', true);

    if (updateError) {
      console.error('Error deactivating existing plans:', updateError);
      // We can continue, but it might lead to multiple active plans if not handled properly.
    }

    // Insert new plan
    const { data: newPlan, error: insertError } = await supabaseAdmin
      .from('user_plans')
      .insert({
        user_id: req.user.id,
        workout_plan: planData.workout_plan,
        nutrition_plan: planData.nutrition_plan,
        macros: planData.macros,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving new plan:', insertError);
      return res.status(500).json({ error: 'Database error while saving plan' });
    }

    return res.json(newPlan);
  } catch (error) {
    console.error('Generate plan error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getCurrentPlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: plan, error } = await supabaseAdmin
      .from('user_plans')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching current plan:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!plan) {
      return res.status(404).json({ error: 'No active plan found' });
    }

    return res.json(plan);
  } catch (error) {
    console.error('Get current plan error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
