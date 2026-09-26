import { useState } from 'react';
import { saveProfile as apiSaveProfile } from '../lib/api';
import { ProfileFormData } from '../types/schemas';
import { useAuth } from './useAuth';

export const useProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { checkProfileStatus } = useAuth();

  const saveProfile = async (data: ProfileFormData) => {
    try {
      setLoading(true);
      setError(null);
      await apiSaveProfile(data);
      await checkProfileStatus();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { saveProfile, loading, error };
};
