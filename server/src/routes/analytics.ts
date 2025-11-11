import { Router } from 'express';
import { prisma } from '../utils/db';
import { authenticate } from '../middleware/auth';

export const analyticsRoutes = Router();

analyticsRoutes.use(authenticate);

// Get monthly summary with income, expenses, and breakdown by category
analyticsRoutes.get('/monthly-summary', async (req, res) => {
  const userId = req.user!.userId;
  const { month, year } = req.query;

  const targetMonth = month ? parseInt(month as string, 10) : new Date().getMonth() + 1;
  const targetYear = year ? parseInt(year as string, 10) : new Date().getFullYear();

  const startDate = new Date(targetYear, targetMonth - 1, 1);
  const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

  const [income, expenses, transactions] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        userId,
        type: 'INCOME',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.transaction.aggregate({
      where: {
        userId,
        type: 'EXPENSE',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
    }),
  ]);

  const monthlyIncome = Number(income._sum.amount || 0);
  const monthlyExpenses = Number(expenses._sum.amount || 0);
  const savings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;

  const expenseBreakdown = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, transaction) => {
      const categoryName = transaction.category.name;
      const amount = Number(transaction.amount);
      
      if (acc[categoryName]) {
        acc[categoryName] += amount;
      } else {
        acc[categoryName] = amount;
      }
      
      return acc;
    }, {} as Record<string, number>);

  const topCategories = Object.entries(expenseBreakdown)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: monthlyExpenses > 0 ? (amount / monthlyExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  res.json({
    success: true,
    data: {
      month: targetMonth,
      year: targetYear,
      income: monthlyIncome,
      expenses: monthlyExpenses,
      savings,
      savingsRate: Number(savingsRate.toFixed(2)),
      expenseBreakdown,
      topCategories,
    },
  });
});

// Get spending trends over multiple months
analyticsRoutes.get('/spending-trends', async (req, res) => {
  const userId = req.user!.userId;
  const { months = '6' } = req.query;

  const monthsCount = parseInt(months as string, 10);
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsCount);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: 'asc' },
  });

  const monthlyData: Record<string, { income: number; expenses: number }> = {};

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expenses: 0 };
    }

    const amount = Number(transaction.amount);
    if (transaction.type === 'INCOME') {
      monthlyData[monthKey].income += amount;
    } else {
      monthlyData[monthKey].expenses += amount;
    }
  });

  const trends = Object.entries(monthlyData).map(([month, data]) => ({
    month,
    income: data.income,
    expenses: data.expenses,
  }));

  res.json({
    success: true,
    data: trends,
  });
});

// Get total spending by category
analyticsRoutes.get('/category-spending', async (req, res) => {
  const userId = req.user!.userId;
  const { startDate, endDate } = req.query;

  const where: any = {
    userId,
  };

  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate as string),
      lte: new Date(endDate as string),
    };
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      category: true,
    },
  });

  const categoryData: Record<string, { total: number; count: number }> = {};
  
  transactions.forEach((transaction) => {
    const categoryName = transaction.category.name;
    const amount = Number(transaction.amount);

    if (categoryData[categoryName]) {
      categoryData[categoryName].total += amount;
      categoryData[categoryName].count += 1;
    } else {
      categoryData[categoryName] = {
        total: amount,
        count: 1,
      };
    }
  });

  const categoryArray = Object.entries(categoryData).map(([name, data]) => ({
    name,
    amount: data.total,
    count: data.count,
    average: data.total / data.count,
  }));

  const categoryDataSorted = categoryArray
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  res.json({
    success: true,
    data: categoryDataSorted,
  });
});
