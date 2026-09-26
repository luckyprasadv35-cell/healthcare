import { z } from 'zod';

// ============================================================
// Enums – Must match the backend Zod enums exactly
// ============================================================

export const GenderValues = ['male', 'female', 'other', 'prefer_not_to_say'] as const;
export const ActivityLevelValues = ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'] as const;
export const GoalValues = ['muscle_gain', 'fat_loss', 'endurance', 'recomposition', 'mobility_recovery'] as const;
export const DietValues = ['standard', 'keto', 'paleo', 'vegan', 'vegetarian', 'pescatarian'] as const;
export const EquipmentValues = ['full_gym', 'dumbbells_only', 'bodyweight_home'] as const;

export type Gender = typeof GenderValues[number];
export type ActivityLevel = typeof ActivityLevelValues[number];
export type Goal = typeof GoalValues[number];
export type Diet = typeof DietValues[number];
export type Equipment = typeof EquipmentValues[number];

// Human-readable label mappings for the UI
export const GenderLabels: Record<Gender, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
  prefer_not_to_say: 'Prefer Not to Say',
};

export const ActivityLevelLabels: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (Little or no exercise)',
  lightly_active: 'Lightly Active (1–3 days/week)',
  moderately_active: 'Moderately Active (3–5 days/week)',
  very_active: 'Very Active (6–7 days/week)',
  extremely_active: 'Extremely Active (Athlete level)',
};

export const GoalLabels: Record<Goal, string> = {
  muscle_gain: 'Muscle Gain / Hypertrophy',
  fat_loss: 'Fat Loss',
  endurance: 'Endurance',
  recomposition: 'Body Recomposition',
  mobility_recovery: 'Mobility & Recovery',
};

export const DietLabels: Record<Diet, string> = {
  standard: 'Standard (No Restrictions)',
  keto: 'Keto',
  paleo: 'Paleo',
  vegan: 'Vegan',
  vegetarian: 'Vegetarian',
  pescatarian: 'Pescatarian',
};

export const EquipmentLabels: Record<Equipment, string> = {
  full_gym: 'Full Gym Access',
  dumbbells_only: 'Dumbbells Only',
  bodyweight_home: 'Bodyweight / Home',
};

// ============================================================
// Profile Form Schema
// ============================================================

export const ProfileFormSchema = z.object({
  age: z.number({ invalid_type_error: 'Age is required' }).int().min(13, 'Must be at least 13').max(120, 'Must be at most 120'),
  gender: z.enum(GenderValues, { errorMap: () => ({ message: 'Please select a gender' }) }),
  weight_kg: z.number({ invalid_type_error: 'Weight is required' }).min(20, 'Minimum 20kg').max(500, 'Maximum 500kg'),
  height_cm: z.number({ invalid_type_error: 'Height is required' }).min(50, 'Minimum 50cm').max(300, 'Maximum 300cm'),
  activity_level: z.enum(ActivityLevelValues, { errorMap: () => ({ message: 'Please select an activity level' }) }),
  goal: z.enum(GoalValues, { errorMap: () => ({ message: 'Please select a goal' }) }),
  diet_preference: z.enum(DietValues, { errorMap: () => ({ message: 'Please select a diet preference' }) }),
  equipment: z.enum(EquipmentValues, { errorMap: () => ({ message: 'Please select equipment availability' }) }),
  medical_notes: z.string().max(500).optional().default(''),
});

export type ProfileFormData = z.infer<typeof ProfileFormSchema>;

// ============================================================
// Auth Form Schemas
// ============================================================

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof RegisterSchema>;

// ============================================================
// Progress Log Schema
// ============================================================

export const ProgressLogSchema = z.object({
  weight_kg: z.number({ invalid_type_error: 'Weight is required' }).min(20, 'Minimum 20kg').max(500, 'Maximum 500kg'),
  notes: z.string().max(500).optional().default(''),
});

export type ProgressLogData = z.infer<typeof ProgressLogSchema>;

// ============================================================
// AI Plan Types – Must match backend planSchema.ts output
// ============================================================

export type Exercise = {
  name: string;
  sets: number;
  reps: string;
  rest_sec: number;
};

export type WorkoutDay = {
  day: number;
  focus: string;
  exercises: Exercise[];
};

export type Meal = {
  type: string;
  description: string;
  calories: number;
};

export type NutritionDay = {
  day: number;
  meals: Meal[];
};

export type Macros = {
  daily_calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
};

export type AIPlanData = {
  macros: Macros;
  workout_plan: WorkoutDay[];
  nutrition_plan: NutritionDay[];
};

export type AIPlan = {
  id: string;
  user_id: string;
  workout_plan: WorkoutDay[];
  nutrition_plan: NutritionDay[];
  macros: Macros;
  is_active: boolean;
  created_at: string;
};

export type ProgressLog = {
  id: string;
  user_id: string;
  weight_kg: number;
  notes: string;
  log_date: string;
  created_at: string;
};
