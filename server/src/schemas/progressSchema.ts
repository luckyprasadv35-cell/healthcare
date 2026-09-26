import { z } from 'zod';

export const ProgressLogSchema = z.object({
  weight_kg: z.number().min(20).max(500),
  notes: z.string().max(500).optional().default(''),
});

export type ProgressLogInput = z.infer<typeof ProgressLogSchema>;
