import { Router } from 'express';
import { prisma } from '../utils/db';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createBudgetSchema, updateBudgetSchema, getBudgetSchema } from '../validations/budget';

export const budgetRoutes = Router();

budgetRoutes.use(authenticate);

// Get all budgets with calculated spending
budgetRoutes.get('/', validate(getBudgetSchema), async (req, res) => {
  const userId = req.user!.userId;
  const { month, year } = req.query as any;

  const where: any = { userId };
  
  if (month) where.month = parseInt(month as string, 10);
  if (year) where.year = parseInt(year as string, 10);

  const budgets = await prisma.budget.findMany({
    where,
    include: {
      category: true,
    },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  });

  // Calculate spending for each budget
  const budgetsWithSpending = await Promise.all(
    budgets.map(async (budget) => {
      const spending = await prisma.transaction.aggregate({
        where: {
          userId,
          categoryId: budget.categoryId,
          type: 'EXPENSE',
          date: {
            gte: new Date(budget.year, budget.month - 1, 1),
            lt: new Date(budget.year, budget.month, 1),
          },
        },
        _sum: {
          amount: true,
        },
      });

      return {
        ...budget,
        spent: spending._sum.amount || 0,
        remaining: Number(budget.amount) - Number(spending._sum.amount || 0),
      };
    })
  );

  res.json({
    success: true,
    data: budgetsWithSpending,
  });
});

// Get single budget
budgetRoutes.get('/:id', async (req, res) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const budget = await prisma.budget.findFirst({
    where: { id, userId },
    include: {
      category: true,
    },
  });

  if (!budget) {
    return res.status(404).json({
      success: false,
      error: 'Budget not found',
    });
  }

  res.json({
    success: true,
    data: budget,
  });
});

// Create new budget
budgetRoutes.post('/', validate(createBudgetSchema), async (req, res) => {
  const userId = req.user!.userId;
  const { categoryId, amount, month, year } = req.body;

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    return res.status(404).json({
      success: false,
      error: 'Category not found',
    });
  }

  const existingBudget = await prisma.budget.findFirst({
    where: {
      userId,
      categoryId,
      month,
      year,
    },
  });

  if (existingBudget) {
    return res.status(400).json({
      success: false,
      error: 'Budget already exists for this category and period',
    });
  }

  const budget = await prisma.budget.create({
    data: {
      userId,
      categoryId,
      amount,
      month,
      year,
    },
    include: {
      category: true,
    },
  });

  res.status(201).json({
    success: true,
    data: budget,
  });
});

// Update budget
budgetRoutes.put('/:id', validate(updateBudgetSchema), async (req, res) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const updateData = req.body;

  const budget = await prisma.budget.findFirst({
    where: { id, userId },
  });

  if (!budget) {
    return res.status(404).json({
      success: false,
      error: 'Budget not found',
    });
  }

  const updatedBudget = await prisma.budget.update({
    where: { id },
    data: updateData,
    include: {
      category: true,
    },
  });

  res.json({
    success: true,
    data: updatedBudget,
  });
});

// Delete budget
budgetRoutes.delete('/:id', async (req, res) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const budget = await prisma.budget.findFirst({
    where: { id, userId },
  });

  if (!budget) {
    return res.status(404).json({
      success: false,
      error: 'Budget not found',
    });
  }

  await prisma.budget.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Budget deleted successfully',
  });
});
