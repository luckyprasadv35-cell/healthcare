import { z } from 'zod';

export const ExerciseSchema = z.object({
  name: z.string(),
  sets: z.number().int().positive(),
  reps: z.string(),
  rest_sec: z.number().int().nonnegative(),
});

export const WorkoutDaySchema = z.object({
  day: z.number().int().min(1).max(7),
  focus: z.string(),
  exercises: z.array(ExerciseSchema).min(1),
});

export const MealSchema = z.object({
  type: z.string(),
  description: z.string(),
  calories: z.number().positive(),
});

export const NutritionDaySchema = z.object({
  day: z.number().int().min(1).max(7),
  meals: z.array(MealSchema).min(1),
});

export const MacrosSchema = z.object({
  daily_calories: z.number().positive(),
  protein_g: z.number().nonnegative(),
  carbs_g: z.number().nonnegative(),
  fats_g: z.number().nonnegative(),
});

export const AIPlanSchema = z.object({
  macros: MacrosSchema,
  workout_plan: z.array(WorkoutDaySchema).length(7),
  nutrition_plan: z.array(NutritionDaySchema).length(7),
});

export type AIPlan = z.infer<typeof AIPlanSchema>;
