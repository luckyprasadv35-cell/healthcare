import React, { useState } from 'react';
import { AIPlan } from '../types/schemas';
import { ChevronDown, ChevronUp, Dumbbell, UtensilsCrossed } from 'lucide-react';

interface WeeklyOverviewProps {
  plan: AIPlan;
}

const WeeklyOverview: React.FC<WeeklyOverviewProps> = ({ plan }) => {
  const [openDays, setOpenDays] = useState<Record<number, boolean>>({ 1: true });

  const toggleDay = (day: number) => {
    setOpenDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const days = Array.from({ length: 7 }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      {days.map(dayNum => {
        const workout = plan.workout_plan.find(w => w.day === dayNum) || { day: dayNum, focus: 'Rest Day', exercises: [] };
        const nutrition = plan.nutrition_plan.find(n => n.day === dayNum) || { day: dayNum, meals: [] };
        const isOpen = openDays[dayNum];

        return (
          <div key={dayNum} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden transition-all duration-300">
            <button
              onClick={() => toggleDay(dayNum)}
              className="w-full flex items-center justify-between p-5 bg-gray-900 hover:bg-gray-800/80 transition"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/20">
                  D{dayNum}
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white">Day {dayNum}</h3>
                  <p className="text-sm text-gray-400">{workout.focus}</p>
                </div>
              </div>
              <div className="text-gray-500">
                {isOpen ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
              </div>
            </button>

            {isOpen && (
              <div className="p-5 border-t border-gray-800 bg-gray-950/50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Workout Section */}
                  <div>
                    <h4 className="flex items-center gap-2 font-bold text-emerald-400 mb-4 border-b border-gray-800 pb-2">
                      <Dumbbell className="h-4 w-4" /> Workout
                    </h4>
                    {workout.exercises.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-300">
                          <thead className="text-xs text-gray-500 uppercase bg-gray-900/50">
                            <tr>
                              <th className="px-3 py-2 rounded-tl-lg">Exercise</th>
                              <th className="px-3 py-2">Sets × Reps</th>
                              <th className="px-3 py-2 rounded-tr-lg">Rest</th>
                            </tr>
                          </thead>
                          <tbody>
                            {workout.exercises.map((ex, i) => (
                              <tr key={i} className="border-b border-gray-800/50 last:border-0">
                                <td className="px-3 py-3 font-medium text-gray-200">{ex.name}</td>
                                <td className="px-3 py-3">{ex.sets} × {ex.reps}</td>
                                <td className="px-3 py-3">{ex.rest_sec}s</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic text-sm py-2">Rest day. Take it easy.</p>
                    )}
                  </div>

                  {/* Nutrition Section */}
                  <div>
                    <h4 className="flex items-center gap-2 font-bold text-cyan-400 mb-4 border-b border-gray-800 pb-2">
                      <UtensilsCrossed className="h-4 w-4" /> Nutrition
                    </h4>
                    <div className="space-y-3">
                      {nutrition.meals.map((meal, i) => (
                        <div key={i} className="bg-gray-900 p-3 rounded-lg border border-gray-800/50">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-cyan-500">{meal.type}</span>
                            <span className="text-xs font-medium text-gray-400">{meal.calories} kcal</span>
                          </div>
                          <p className="text-sm text-gray-300">{meal.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WeeklyOverview;
