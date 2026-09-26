import { z } from 'zod';

export const GenderEnum = z.enum(['male', 'female', 'other', 'prefer_not_to_say']);
export const ActivityLevelEnum = z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']);
export const GoalEnum = z.enum(['muscle_gain', 'fat_loss', 'endurance', 'recomposition', 'mobility_recovery']);
export const DietEnum = z.enum(['standard', 'keto', 'paleo', 'vegan', 'vegetarian', 'pescatarian']);
export const EquipmentEnum = z.enum(['full_gym', 'dumbbells_only', 'bodyweight_home']);

export const ProfileSchema = z.object({
  age: z.number().int().min(13).max(120),
  weight_kg: z.number().min(20).max(500),
  height_cm: z.number().min(50).max(300),
  gender: GenderEnum,
  activity_level: ActivityLevelEnum,
  goal: GoalEnum,
  diet_preference: DietEnum,
  equipment: EquipmentEnum,
  medical_notes: z.string().max(500).optional().default(''),
});

export type ProfileInput = z.infer<typeof ProfileSchema>;
