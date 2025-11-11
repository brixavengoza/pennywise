import { Router } from 'express';
import { prisma } from '../utils/db';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createTransactionSchema,
  updateTransactionSchema,
  getTransactionsSchema,
} from '../validations/transactions';

export const transactionRoutes = Router();

transactionRoutes.use(authenticate);

transactionRoutes.get('/', validate(getTransactionsSchema), async (req, res) => {
  const userId = req.user!.userId;
  
  const { page = 1, limit = 20, type, startDate, endDate, categoryId, search } = req.query as any;

  const where: any = { userId };

  if (type) where.type = type;
  if (categoryId) where.categoryId = categoryId;
  
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  // Search finction: description, category, amount, date
  if (search) {
    const searchConditions: any[] = [];
    
    searchConditions.push(
      { description: { contains: search, mode: 'insensitive' } },
      { category: { name: { contains: search, mode: 'insensitive' } } }
    );
    
    const numericValue = parseFloat(search);
    if (!isNaN(numericValue) && isFinite(numericValue)) {
      searchConditions.push({
        amount: {
          gte: numericValue - 0.01,
          lte: numericValue + 0.01,
        },
      });
    }
    
    const dateValue = new Date(search);
    if (!isNaN(dateValue.getTime())) {
      const startOfDay = new Date(dateValue);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateValue);
      endOfDay.setHours(23, 59, 59, 999);
      
      searchConditions.push({
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      });
    }
    
    const dateFormats = [
      /^\d{4}-\d{2}-\d{2}$/,
      /^\d{2}\/\d{2}\/\d{4}$/,
      /^\d{2}-\d{2}-\d{4}$/,
    ];
    
    for (const format of dateFormats) {
      if (format.test(search)) {
        const parsedDate = new Date(search);
        if (!isNaN(parsedDate.getTime())) {
          const startOfDay = new Date(parsedDate);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(parsedDate);
          endOfDay.setHours(23, 59, 59, 999);
          
          searchConditions.push({
            date: {
              gte: startOfDay,
              lte: endOfDay,
            },
          });
          break;
        }
      }
    }
    
    if (searchConditions.length > 0) {
      where.OR = searchConditions;
    }
  }

  const pageNum = parseInt(String(page), 10);
  const limitNum = parseInt(String(limit), 10);

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { date: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.transaction.count({ where }),
  ]);

  res.json({
    success: true,
    data: transactions,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

transactionRoutes.get('/:id', async (req, res) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const transaction = await prisma.transaction.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      category: true,
    },
  });

  if (!transaction) {
    return res.status(404).json({
      success: false,
      error: 'Transaction not found',
    });
  }

  res.json({
    success: true,
    data: transaction,
  });
});

transactionRoutes.post('/', validate(createTransactionSchema), async (req, res) => {
  const userId = req.user!.userId;
  const { categoryId, amount, description, date, type } = req.body;

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    return res.status(404).json({
      success: false,
      error: 'Category not found',
    });
  }

  if (category.type !== type) {
    return res.status(400).json({
      success: false,
      error: 'Category type does not match transaction type',
    });
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      categoryId,
      amount,
      description,
      date: date ? new Date(date) : new Date(),
      type,
    },
    include: {
      category: true,
    },
  });

  res.status(201).json({
    success: true,
    data: transaction,
  });
});

transactionRoutes.put('/:id', validate(updateTransactionSchema), async (req, res) => {
  const userId = req.user!.userId;
  const { id } = req.params;
  const updateData = req.body;

  const existingTransaction = await prisma.transaction.findFirst({
    where: { id, userId },
  });

  if (!existingTransaction) {
    return res.status(404).json({
      success: false,
      error: 'Transaction not found',
    });
  }

  if (updateData.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: updateData.categoryId },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      });
    }
  }

  if (updateData.date) {
    updateData.date = new Date(updateData.date);
  }

  const transaction = await prisma.transaction.update({
    where: { id },
    data: updateData,
    include: {
      category: true,
    },
  });

  res.json({
    success: true,
    data: transaction,
  });
});

transactionRoutes.delete('/:id', async (req, res) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const transaction = await prisma.transaction.findFirst({
    where: { id, userId },
  });

  if (!transaction) {
    return res.status(404).json({
      success: false,
      error: 'Transaction not found',
    });
  }

  await prisma.transaction.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Transaction deleted successfully',
  });
});
