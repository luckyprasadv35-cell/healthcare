import { useState, useEffect, useCallback } from 'react';
import { getCurrentPlan } from '../lib/api';
import { AIPlan } from '../types/schemas';
import { useAuth } from './useAuth';

export const usePlan = () => {
  const [plan, setPlan] = useState<AIPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  const fetchPlan = useCallback(async () => {
    if (!session) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getCurrentPlan();
      // The API returns the plan row directly from Supabase
      setPlan(data as AIPlan);
    } catch (err: any) {
      const msg = err.message || 'Failed to fetch plan';
      // Don't treat "no plan found" as an error state
      if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('no active plan')) {
        setPlan(null);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  return { plan, loading, error, refetch: fetchPlan };
};
