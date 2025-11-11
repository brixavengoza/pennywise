import { Router } from 'express';
import { prisma } from '../utils/db';
import { authenticate } from '../middleware/auth';

export const categoryRoutes = Router();

categoryRoutes.use(authenticate);

categoryRoutes.get('/', async (req, res) => {
  const { type } = req.query as any;

  const where: any = {};
  if (type && (type === 'INCOME' || type === 'EXPENSE')) {
    where.type = type;
  }

  const categories = await prisma.category.findMany({
    where,
    orderBy: [
      { type: 'asc' },
      { name: 'asc' },
    ],
  });

  res.json({
    success: true,
    data: categories,
  });
});

