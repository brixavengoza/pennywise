import { z } from 'zod';

export const createBudgetSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  amount: z.number().positive('Amount must be positive'),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
});

export const updateBudgetSchema = createBudgetSchema.partial();

export const getBudgetSchema = z.object({
  month: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
  year: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
});
