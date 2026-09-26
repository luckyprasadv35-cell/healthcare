import { Response } from 'express';
import { AuthenticatedRequest, supabaseAdmin } from '../middlewares/authMiddleware';

export const upsertProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profileData = {
      ...req.body,
      id: req.user.id,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData)
      .select()
      .single();

    if (error) {
      console.error('Error upserting profile:', error);
      return res.status(500).json({ error: 'Database error while saving profile' });
    }

    return res.json(data);
  } catch (error) {
    console.error('Upsert profile error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
