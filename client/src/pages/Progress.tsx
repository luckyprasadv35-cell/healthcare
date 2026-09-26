import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProgressLogSchema, ProgressLog } from '../types/schemas';
import { logProgress, getProgressHistory, generatePlan } from '../lib/api';
import { usePlan } from '../hooks/usePlan';
import AdvisoryBanner from '../components/AdvisoryBanner';
import { Activity, Plus, TrendingDown } from 'lucide-react';
import { z } from 'zod';

type FormData = z.infer<typeof ProgressLogSchema>;

const Progress: React.FC = () => {
  const [history, setHistory] = useState<ProgressLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);
  const { refetch } = usePlan();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(ProgressLogSchema),
  });

  const fetchHistory = async () => {
    try {
      const data = await getProgressHistory();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch progress history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      setLogError(null);
      const response = await logProgress(data);
      reset();
      await fetchHistory();
      if (response.shouldRegenerate) {
        setShowPrompt(true);
      }
    } catch (err: any) {
      console.error(err);
      setLogError(err.message || 'Failed to log progress');
    }
  };

  const handleRegenerate = async () => {
    setShowPrompt(false);
    try {
      await generatePlan();
      await refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-3xl font-bold text-white mb-2">Track Progress</h1>
        <p className="text-gray-400 mb-8">Log your weight to help the AI adapt your plan over time.</p>

        {showPrompt && (
          <div className="bg-emerald-900/40 border border-emerald-500/50 rounded-xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-emerald-400 font-bold text-lg mb-1">Significant Progress Detected!</h3>
              <p className="text-gray-300 text-sm">Your weight has changed by more than 2kg. Would you like to regenerate your AI plan to match your new biometrics?</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button onClick={() => setShowPrompt(false)} className="px-4 py-2 text-gray-400 hover:text-white transition text-sm font-medium">Dismiss</button>
              <button onClick={handleRegenerate} className="bg-emerald-500 text-gray-950 px-4 py-2 rounded-lg font-bold hover:bg-emerald-400 transition text-sm">Regenerate Now</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-500" /> New Entry
              </h2>
              {logError && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs p-3 rounded-lg mb-4">
                  {logError}
                </div>
              )}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Weight (kg)</label>
                  <input type="number" step="0.1" {...register('weight_kg', { valueAsNumber: true })} className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none" placeholder="e.g. 70.5" />
                  {errors.weight_kg && <p className="text-red-400 text-xs mt-1">{errors.weight_kg.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Notes (Optional)</label>
                  <textarea {...register('notes')} rows={3} className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-white resize-none focus:border-emerald-500 focus:outline-none" placeholder="How do you feel today?" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-500 text-gray-950 py-2.5 rounded-lg font-bold hover:bg-emerald-400 transition disabled:opacity-50 flex justify-center items-center">
                  {isSubmitting ? <Activity className="h-5 w-5 animate-pulse" /> : 'Save Entry'}
                </button>
              </form>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 h-full">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-cyan-500" /> History
              </h2>

              {loading ? (
                <div className="flex justify-center py-10"><Activity className="h-8 w-8 text-gray-500 animate-pulse" /></div>
              ) : history.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-gray-800">
                  <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-950">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Weight</th>
                        <th className="px-4 py-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {history.map((entry, idx) => (
                        <tr key={entry.id || idx} className="bg-gray-900 hover:bg-gray-800/50">
                          <td className="px-4 py-3 whitespace-nowrap">{new Date(entry.log_date || entry.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3 font-medium text-emerald-400">{entry.weight_kg} kg</td>
                          <td className="px-4 py-3 text-gray-400 truncate max-w-xs">{entry.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500 bg-gray-950/50 rounded-lg border border-gray-800/50">
                  No progress entries yet. Start logging your weight to see history!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <AdvisoryBanner />
    </div>
  );
};

export default Progress;
