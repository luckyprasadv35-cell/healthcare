import { Request, Response, NextFunction } from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
}

let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const url = process.env.SUPABASE_URL;
    // Prioritize explicitly named secret key or fallback to service role key
    const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key || url === 'https://your-project.supabase.co' || url.includes('YOUR_SUPABASE')) {
      throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY/SUPABASE_SERVICE_ROLE_KEY environment variables are required in server/.env.');
    }

    _supabaseAdmin = createClient(url, key);
  }
  return _supabaseAdmin;
}

// Proxy/getter export for backward compatibility across controllers
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const instance = getSupabaseAdmin() as any;
    const value = instance[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const admin = getSupabaseAdmin();
    const { data: { user }, error } = await admin.auth.getUser(token);

    if (error || !user || !user.email) {
      return res.status(401).json({ error: 'Invalid token or expired session' });
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error.message || error);
    res.status(500).json({ error: error.message || 'Internal Auth Error' });
  }
};
