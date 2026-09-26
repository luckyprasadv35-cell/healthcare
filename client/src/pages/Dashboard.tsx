import React from 'react';
import { Link } from 'react-router-dom';
import { usePlan } from '../hooks/usePlan';
import MetricCard from '../components/MetricCard';
import DailyAgenda from '../components/DailyAgenda';
import AdvisoryBanner from '../components/AdvisoryBanner';
import { Flame, Beef, Wheat, Droplets, Activity } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { plan, loading, error } = usePlan();

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Activity className="h-12 w-12 text-emerald-500 animate-pulse" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4">
        <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">No Active Plan</h2>
          <p className="text-gray-400 mb-8">You don't have a generated AI plan yet. Let's create one based on your profile.</p>
          <Link to="/onboarding" className="bg-emerald-500 text-gray-950 px-6 py-3 rounded-lg font-bold hover:bg-emerald-400 transition w-full block">
            Generate Plan
          </Link>
        </div>
      </div>
    );
  }

  // Get current day of week (1-7, where Monday = 1)
  const today = new Date().getDay();
  const dayNumber = today === 0 ? 7 : today;

  const todayWorkout = plan.workout_plan.find(w => w.day === dayNumber);
  const todayNutrition = plan.nutrition_plan.find(n => n.day === dayNumber);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-1">Day {dayNumber} of your personalized program</p>
          </div>
          <Link to="/plan" className="text-emerald-400 hover:text-emerald-300 font-medium text-sm hidden sm:block">
            View Full Week Plan &rarr;
          </Link>
        </div>

        {/* Macros Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <MetricCard title="Daily Target" value={plan.macros.daily_calories} unit="kcal" icon={<Flame className="h-5 w-5" />} color="bg-orange-500" />
          <MetricCard title="Protein" value={plan.macros.protein_g} unit="g" icon={<Beef className="h-5 w-5" />} color="bg-red-500" />
          <MetricCard title="Carbs" value={plan.macros.carbs_g} unit="g" icon={<Wheat className="h-5 w-5" />} color="bg-amber-500" />
          <MetricCard title="Fats" value={plan.macros.fats_g} unit="g" icon={<Droplets className="h-5 w-5" />} color="bg-yellow-500" />
        </div>

        <DailyAgenda workoutDay={todayWorkout} nutritionDay={todayNutrition} />
        
        <div className="mt-8 text-center sm:hidden">
          <Link to="/plan" className="text-emerald-400 hover:text-emerald-300 font-medium text-sm">
            View Full Week Plan &rarr;
          </Link>
        </div>
      </div>
      <AdvisoryBanner />
    </div>
  );
};

export default Dashboard;
