import { z } from 'zod';

export const createTransactionSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
  type: z.enum(['INCOME', 'EXPENSE'], {
    errorMap: () => ({ message: 'Type must be INCOME or EXPENSE' }),
  }),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const getTransactionsSchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  categoryId: z.string().uuid().optional(),
  search: z.string().optional(),
});
