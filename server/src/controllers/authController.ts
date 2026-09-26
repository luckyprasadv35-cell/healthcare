import express, { Response } from 'express';
import { AuthenticatedRequest, supabaseAdmin } from '../middlewares/authMiddleware';

export const syncAuth = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
      console.error('Error fetching profile:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    if (profile) {
      return res.json({ exists: true, profile });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error('Sync auth error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const registerUser = async (req: express.Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    // Using Admin API bypasses the Supabase email rate limits and auto-confirms the user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ user: data.user });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
