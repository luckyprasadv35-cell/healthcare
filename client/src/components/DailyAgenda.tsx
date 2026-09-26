import React from 'react';
import { WorkoutDay, NutritionDay } from '../types/schemas';
import { Dumbbell, UtensilsCrossed, Clock } from 'lucide-react';

interface DailyAgendaProps {
  workoutDay?: WorkoutDay;
  nutritionDay?: NutritionDay;
}

const DailyAgenda: React.FC<DailyAgendaProps> = ({ workoutDay, nutritionDay }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Workout Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
          <div className="bg-emerald-500/20 p-2 rounded-lg">
            <Dumbbell className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Today's Workout</h2>
            <p className="text-emerald-400 text-sm font-medium">{workoutDay?.focus || 'Rest Day'}</p>
          </div>
        </div>

        {workoutDay && workoutDay.exercises.length > 0 ? (
          <div className="space-y-4">
            {workoutDay.exercises.map((exercise, idx) => (
              <div key={idx} className="bg-gray-950/50 p-4 rounded-xl border border-gray-800/50 hover:border-gray-700 transition">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-white font-medium">{exercise.name}</h4>
                  <div className="flex items-center gap-1 text-gray-400 text-xs bg-gray-800 px-2 py-1 rounded">
                    <Clock className="h-3 w-3" /> {exercise.rest_sec}s rest
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  <span className="text-emerald-400 font-medium">{exercise.sets}</span> sets × <span className="text-emerald-400 font-medium">{exercise.reps}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            Enjoy your rest day! Focus on recovery.
          </div>
        )}
      </div>

      {/* Meals Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
          <div className="bg-cyan-500/20 p-2 rounded-lg">
            <UtensilsCrossed className="h-6 w-6 text-cyan-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Today's Meals</h2>
            <p className="text-cyan-400 text-sm font-medium">Nutritional Plan</p>
          </div>
        </div>

        {nutritionDay && nutritionDay.meals.length > 0 ? (
          <div className="space-y-4">
            {nutritionDay.meals.map((meal, idx) => (
              <div key={idx} className="bg-gray-950/50 p-4 rounded-xl border border-gray-800/50 hover:border-gray-700 transition">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-cyan-400 font-medium text-sm uppercase tracking-wider">{meal.type}</h4>
                  <span className="text-white font-bold">{meal.calories} kcal</span>
                </div>
                <p className="text-gray-300 text-sm">{meal.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            No meals planned for today.
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyAgenda;
