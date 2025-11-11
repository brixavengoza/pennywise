import { Router } from 'express';
import { prisma } from '../utils/db';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createGoalSchema, updateGoalSchema } from '../validations/goals';

export const goalRoutes = Router();

goalRoutes.use(authenticate);

// Get all goals
goalRoutes.get('/', async (req, res) => {
  const userId = req.user!.userId;
  const { status } = req.query;

  const where: any = { userId };
  
  if (status) {
    where.status = status;
  }

  const goals = await prisma.goal.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: goals,
  });
});

// Get single goal
goalRoutes.get('/:id', async (req, res) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const goal = await prisma.goal.findFirst({
    where: { id, userId },
  });

  if (!goal) {
    return res.status(404).json({
      success: false,
      error: 'Goal not found',
    });
  }

  res.json({
    success: true,
    data: goal,
  });
});

// Create new goal
goalRoutes.post('/', validate(createGoalSchema), async (req, res) => {
  const userId = req.user!.userId;
  const { title, description, targetAmount, targetDate } = req.body;

  const goal = await prisma.goal.create({
    data: {
      userId,
      title,
      description,
      targetAmount,
      targetDate: targetDate ? new Date(targetDate) : null,
      status: 'IN_PROGRESS',
    },
  });

  res.status(201).json({
    success: true,
    data: goal,
  });
});

// Update goal
goalRoutes.put('/:id', validate(updateGoalSchema), async (req, res) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const updateData: any = req.body;

  const goal = await prisma.goal.findFirst({
    where: { id, userId },
  });

  if (!goal) {
    return res.status(404).json({
      success: false,
      error: 'Goal not found',
    });
  }

  if (updateData.targetDate) {
    updateData.targetDate = new Date(updateData.targetDate);
  }

  const updatedGoal = await prisma.goal.update({
    where: { id },
    data: updateData,
  });

  res.json({
    success: true,
    data: updatedGoal,
  });
});

// Delete goal
goalRoutes.delete('/:id', async (req, res) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const goal = await prisma.goal.findFirst({
    where: { id, userId },
  });

  if (!goal) {
    return res.status(404).json({
      success: false,
      error: 'Goal not found',
    });
  }

  await prisma.goal.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Goal deleted successfully',
  });
});
