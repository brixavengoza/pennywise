import { z } from 'zod';

export const createGoalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  targetAmount: z.number().positive('Target amount must be positive'),
  targetDate: z.string().datetime().optional(),
});

export const updateGoalSchema = createGoalSchema.partial().extend({
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
});
