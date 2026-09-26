import { supabase } from './supabase';
import { ProfileFormData, AIPlan } from '../types/schemas';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    throw new Error('Unauthorized or session expired');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || errorData.message || `API Error: ${response.statusText}`;
    const details = errorData.details ? ` (${errorData.details})` : '';
    throw new Error(errorMessage + details);
  }

  return response.json();
}

export const syncAuth = async () => {
  return fetchWithAuth('/auth/sync', { method: 'POST' });
};

export const saveProfile = async (data: ProfileFormData) => {
  return fetchWithAuth('/profile', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const generatePlan = async () => {
  return fetchWithAuth('/plan/generate', { method: 'POST' });
};

export const getCurrentPlan = async (): Promise<AIPlan> => {
  return fetchWithAuth('/plan/current');
};

export const logProgress = async (data: { weight_kg: number; notes?: string }) => {
  return fetchWithAuth('/progress/log', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getProgressHistory = async () => {
  return fetchWithAuth('/progress/history');
};
