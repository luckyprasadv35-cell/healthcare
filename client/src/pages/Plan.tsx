import React, { useState } from 'react';
import { usePlan } from '../hooks/usePlan';
import { generatePlan } from '../lib/api';
import WeeklyOverview from '../components/WeeklyOverview';
import AdvisoryBanner from '../components/AdvisoryBanner';
import { Activity, RefreshCw } from 'lucide-react';

const Plan: React.FC = () => {
  const { plan, loading, error, refetch } = usePlan();
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      await generatePlan();
      await refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRegenerating(false);
    }
  };

  if (loading || isRegenerating) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
        <Activity className="h-12 w-12 text-emerald-500 animate-pulse mb-4" />
        <p className="text-gray-400">{isRegenerating ? 'Generating new AI plan...' : 'Loading your plan...'}</p>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-400 mb-4">{error || 'No plan found'}</p>
        <button onClick={handleRegenerate} className="bg-emerald-500 text-gray-950 px-6 py-2 rounded font-bold">
          Generate Plan
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Your Weekly Plan</h1>
            <p className="text-gray-400 mt-1">Comprehensive 7-day workout and nutrition guide</p>
          </div>
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition border border-gray-700 text-sm font-medium"
          >
            <RefreshCw className="h-4 w-4" /> Regenerate Plan
          </button>
        </div>

        <WeeklyOverview plan={plan} />
      </div>
      <AdvisoryBanner />
    </div>
  );
};

export default Plan;
