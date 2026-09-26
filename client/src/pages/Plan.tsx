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
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                import('html2pdf.js').then((html2pdf) => {
                  const element = document.getElementById('plan-content-to-download');
                  const opt = {
                    margin: 0.5,
                    filename: 'Vitalis_AI_Weekly_Plan.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#030712' },
                    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                  };
                  html2pdf.default().set(opt).from(element).save();
                });
              }}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition shadow-lg text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Download PDF
            </button>
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition border border-gray-700 text-sm font-medium"
            >
              <RefreshCw className="h-4 w-4" /> Regenerate Plan
            </button>
          </div>
        </div>

        <div id="plan-content-to-download" className="bg-gray-950 p-2 rounded-xl">
          <WeeklyOverview plan={plan} />
        </div>
      </div>
      <AdvisoryBanner />
    </div>
  );
};

export default Plan;
