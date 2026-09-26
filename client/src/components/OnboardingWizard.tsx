import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ProfileFormSchema,
  ProfileFormData,
  GenderValues,
  GenderLabels,
  ActivityLevelValues,
  ActivityLevelLabels,
  GoalValues,
  GoalLabels,
  DietValues,
  DietLabels,
  EquipmentValues,
  EquipmentLabels,
} from '../types/schemas';
import { Activity, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { saveProfile, generatePlan } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const STEPS = ['Personal Info', 'Fitness Profile', 'Dietary Preferences', 'Review & Confirm'];

const OnboardingWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const navigate = useNavigate();
  const { checkProfileStatus } = useAuth();

  const { register, handleSubmit, formState: { errors }, watch, trigger } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      gender: 'male',
      activity_level: 'moderately_active',
      goal: 'fat_loss',
      diet_preference: 'standard',
      equipment: 'full_gym',
      age: 25,
      weight_kg: 70,
      height_cm: 170,
      medical_notes: '',
    }
  });

  const formData = watch();

  const handleNext = async () => {
    let fieldsToValidate: (keyof ProfileFormData)[] = [];
    if (currentStep === 0) fieldsToValidate = ['age', 'gender', 'weight_kg', 'height_cm'];
    else if (currentStep === 1) fieldsToValidate = ['activity_level', 'goal', 'equipment'];
    else if (currentStep === 2) fieldsToValidate = ['diet_preference', 'medical_notes'];

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => setCurrentStep(prev => prev - 1);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsGenerating(true);
      setSubmitError('');

      setProgressMessage('Saving your profile...');
      await saveProfile(data);

      setProgressMessage('Generating your personalized AI plan...');
      await generatePlan();

      setProgressMessage('Almost there...');
      await checkProfileStatus();

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      setSubmitError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsGenerating(false);
      setProgressMessage('');
    }
  };

  const renderLabel = (value: string, labels: Record<string, string>) => {
    return labels[value] || value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-800 -z-10"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 transition-all duration-500 -z-10"
               style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}></div>

          {STEPS.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                idx <= currentStep ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-gray-800 text-gray-500 border border-gray-700'
              }`}>
                {idx < currentStep ? <CheckCircle className="h-5 w-5" /> : idx + 1}
              </div>
              <span className={`text-xs mt-2 hidden sm:block ${idx <= currentStep ? 'text-emerald-400' : 'text-gray-500'}`}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Loading Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <Activity className="h-16 w-16 text-emerald-500 animate-pulse mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">Analyzing Profile</h3>
            <p className="text-gray-400 animate-pulse">{progressMessage}</p>
          </div>
        )}

        {submitError && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-4 rounded-lg mb-6">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Personal Info */}
          <div className={`transition-opacity duration-300 ${currentStep === 0 ? 'block' : 'hidden'}`}>
            <h2 className="text-2xl font-bold text-white mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Age</label>
                <input type="number" {...register('age', { valueAsNumber: true })} className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition" />
                {errors.age && <p className="text-red-400 text-xs mt-1">{errors.age.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Gender</label>
                <select {...register('gender')} className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2.5 text-white appearance-none focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition">
                  {GenderValues.map(g => <option key={g} value={g}>{GenderLabels[g]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Weight (kg)</label>
                <input type="number" step="0.1" {...register('weight_kg', { valueAsNumber: true })} className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition" />
                {errors.weight_kg && <p className="text-red-400 text-xs mt-1">{errors.weight_kg.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Height (cm)</label>
                <input type="number" {...register('height_cm', { valueAsNumber: true })} className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition" />
                {errors.height_cm && <p className="text-red-400 text-xs mt-1">{errors.height_cm.message}</p>}
              </div>
            </div>
          </div>

          {/* Step 2: Fitness Profile */}
          <div className={`transition-opacity duration-300 ${currentStep === 1 ? 'block' : 'hidden'}`}>
            <h2 className="text-2xl font-bold text-white mb-6">Fitness Profile</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Current Activity Level</label>
                <select {...register('activity_level')} className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white appearance-none focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition">
                  {ActivityLevelValues.map(al => <option key={al} value={al}>{ActivityLevelLabels[al]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Primary Goal</label>
                <select {...register('goal')} className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white appearance-none focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition">
                  {GoalValues.map(g => <option key={g} value={g}>{GoalLabels[g]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Available Equipment</label>
                <select {...register('equipment')} className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white appearance-none focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition">
                  {EquipmentValues.map(e => <option key={e} value={e}>{EquipmentLabels[e]}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Step 3: Dietary Preferences */}
          <div className={`transition-opacity duration-300 ${currentStep === 2 ? 'block' : 'hidden'}`}>
            <h2 className="text-2xl font-bold text-white mb-6">Dietary Preferences</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Diet Type</label>
                <select {...register('diet_preference')} className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white appearance-none focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition">
                  {DietValues.map(d => <option key={d} value={d}>{DietLabels[d]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Medical Notes / Injuries (Optional)</label>
                <textarea
                  {...register('medical_notes')}
                  rows={4}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white resize-none focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                  placeholder="E.g., Bad knees, allergic to peanuts..."
                />
              </div>
            </div>
          </div>

          {/* Step 4: Review & Confirm */}
          <div className={`transition-opacity duration-300 ${currentStep === 3 ? 'block' : 'hidden'}`}>
            <h2 className="text-2xl font-bold text-white mb-6">Review & Confirm</h2>
            <div className="bg-gray-950 rounded-xl p-6 border border-gray-800 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Age:</span> <span className="text-white font-medium">{formData.age}</span></div>
                <div><span className="text-gray-500">Gender:</span> <span className="text-white font-medium">{renderLabel(formData.gender, GenderLabels)}</span></div>
                <div><span className="text-gray-500">Weight:</span> <span className="text-white font-medium">{formData.weight_kg} kg</span></div>
                <div><span className="text-gray-500">Height:</span> <span className="text-white font-medium">{formData.height_cm} cm</span></div>
                <div className="col-span-2 border-t border-gray-800 my-2 pt-2"></div>
                <div><span className="text-gray-500">Activity:</span> <span className="text-white font-medium">{renderLabel(formData.activity_level, ActivityLevelLabels)}</span></div>
                <div><span className="text-gray-500">Goal:</span> <span className="text-white font-medium text-emerald-400">{renderLabel(formData.goal, GoalLabels)}</span></div>
                <div><span className="text-gray-500">Equipment:</span> <span className="text-white font-medium">{renderLabel(formData.equipment, EquipmentLabels)}</span></div>
                <div><span className="text-gray-500">Diet:</span> <span className="text-white font-medium">{renderLabel(formData.diet_preference, DietLabels)}</span></div>
                {formData.medical_notes && (
                  <>
                    <div className="col-span-2 border-t border-gray-800 my-2 pt-2"></div>
                    <div className="col-span-2"><span className="text-gray-500">Medical Notes:</span> <span className="text-white font-medium">{formData.medical_notes}</span></div>
                  </>
                )}
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-6 text-center">
              Click submit to generate your personalized AI health plan. This might take a few seconds.
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-800">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0 || isGenerating}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition ${
                currentStep === 0 ? 'text-transparent bg-transparent cursor-default' : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 bg-emerald-500 text-gray-950 px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-400 transition"
              >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isGenerating}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-8 py-2.5 rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                Generate My Plan
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingWizard;
