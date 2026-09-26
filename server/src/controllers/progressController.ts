import { Response } from 'express';
import { AuthenticatedRequest, supabaseAdmin } from '../middlewares/authMiddleware';

export const logProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { weight_kg, notes } = req.body;

    // Fetch current profile to get old weight
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('weight_kg')
      .eq('id', req.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile for progress log:', profileError);
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Insert progress log
    const { error: insertError } = await supabaseAdmin
      .from('progress_logs')
      .insert({
        user_id: req.user.id,
        weight_kg,
        notes,
        log_date: new Date().toISOString().split('T')[0]
      });

    if (insertError) {
      console.error('Error inserting progress log:', insertError);
      return res.status(500).json({ error: 'Failed to log progress' });
    }

    // Update profile weight
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ weight_kg, updated_at: new Date().toISOString() })
      .eq('id', req.user.id);

    if (updateError) {
      console.error('Error updating profile weight:', updateError);
      return res.status(500).json({ error: 'Failed to update profile weight' });
    }

    // Check if regeneration is needed (> 2kg diff)
    const oldWeight = profile.weight_kg;
    const shouldRegenerate = Math.abs(oldWeight - weight_kg) > 2;

    return res.json({ logged: true, shouldRegenerate });
  } catch (error) {
    console.error('Log progress error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getProgressHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabaseAdmin
      .from('progress_logs')
      .select('*')
      .eq('user_id', req.user.id)
      .order('log_date', { ascending: false });

    if (error) {
      console.error('Error fetching progress history:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    return res.json(data || []);
  } catch (error) {
    console.error('Get progress history error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
