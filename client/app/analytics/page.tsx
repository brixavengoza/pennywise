'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Box, Heading, Text, VStack, HStack, Grid, Skeleton, Select, createListCollection } from '@chakra-ui/react';
import { useMonthlySummary } from '@/hooks/useMonthlySummary';
import { useSpendingTrends } from '@/hooks/useSpendingTrends';
import { useCategorySpending } from '@/hooks/useCategorySpending';
import { useBudgets } from '@/hooks/useBudgets';
import { useGoals } from '@/hooks/useGoals';
import { useTransactions } from '@/hooks/useTransactions';
import { useCurrency } from '@/hooks/useCurrency';
import { format } from 'date-fns';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { useColorMode } from '@/components/ui/color-mode';
import { TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

// Custom plugin to display percentages on doughnut chart slices
const createDoughnutLabelPlugin = (colorMode: string) => ({
  id: 'doughnutLabel',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  afterDraw: (chart: any) => {
    const ctx = chart.ctx;
    const meta = chart.getDatasetMeta(0);
    if (!meta || !meta.data) return;
    
    const total = meta.data.reduce((sum: number, segment: { value?: number }) => {
      return sum + (segment.value || 0);
    }, 0);

    meta.data.forEach((segment: { value?: number; x?: number; y?: number; innerRadius?: number; outerRadius?: number; startAngle?: number; endAngle?: number }) => {
      if (!segment || typeof segment.x === 'undefined' || typeof segment.y === 'undefined') return;
      
      const value = segment.value || 0;
      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
      
      // Calculate center point of the slice
      const startAngle = segment.startAngle || 0;
      const endAngle = segment.endAngle || 0;
      const innerRadius = segment.innerRadius || 0;
      const outerRadius = segment.outerRadius || 0;
      
      const angle = (startAngle + endAngle) / 2;
      const radius = (innerRadius + outerRadius) / 2;
      const x = segment.x + Math.cos(angle) * radius;
      const y = segment.y + Math.sin(angle) * radius;
      
      // Draw percentage text
      ctx.save();
      const textColor = chart.options?.plugins?.legend?.labels?.color || (colorMode === 'dark' ? '#E2E8F0' : '#2D3748');
      ctx.fillStyle = textColor;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${percentage}%`, x, y);
      ctx.restore();
    });
  },
});

export default function AnalyticsPage() {
  const { symbol } = useCurrency();
  const { colorMode } = useColorMode();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Current month data
  const { monthlySummary, isLoading: isLoadingSummary } = useMonthlySummary({
    month: selectedMonth,
    year: selectedYear,
  });

  // Previous month for comparison
  const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
  const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
  const { monthlySummary: prevMonthlySummary } = useMonthlySummary({
    month: prevMonth,
    year: prevYear,
  });

  // Year-over-year comparison
  const { monthlySummary: yoySummary } = useMonthlySummary({
    month: selectedMonth,
    year: selectedYear - 1,
  });

  useSpendingTrends({
    months: 12,
  });

  const { categorySpending, isLoading: isLoadingCategory } = useCategorySpending();

  const { budgets, isLoading: isLoadingBudgets } = useBudgets({
    month: selectedMonth,
    year: selectedYear,
  });

  useGoals();

  // Get transactions for additional insights
  const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString();
  const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59).toISOString();
  const { transactions } = useTransactions({
    startDate,
    endDate,
    limit: 100,
    sortBy: 'amount',
    sortOrder: 'desc',
  });

  const formatAmount = (amount: number) => {
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Calculate month-over-month growth
  const calculateMoMGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const incomeGrowth = useMemo(() => {
    if (!monthlySummary || !prevMonthlySummary) return 0;
    return calculateMoMGrowth(monthlySummary.income, prevMonthlySummary.income);
  }, [monthlySummary, prevMonthlySummary]);

  const expenseGrowth = useMemo(() => {
    if (!monthlySummary || !prevMonthlySummary) return 0;
    return calculateMoMGrowth(monthlySummary.expenses, prevMonthlySummary.expenses);
  }, [monthlySummary, prevMonthlySummary]);

  // Year-over-year comparison
  const yoyIncomeChange = useMemo(() => {
    if (!monthlySummary || !yoySummary) return 0;
    return calculateMoMGrowth(monthlySummary.income, yoySummary.income);
  }, [monthlySummary, yoySummary]);

  const yoyExpenseChange = useMemo(() => {
    if (!monthlySummary || !yoySummary) return 0;
    return calculateMoMGrowth(monthlySummary.expenses, yoySummary.expenses);
  }, [monthlySummary, yoySummary]);

  // Calculate spending velocity (daily average)
  const spendingVelocity = useMemo(() => {
    if (!monthlySummary) return 0;
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    return monthlySummary.expenses / daysInMonth;
  }, [monthlySummary, selectedMonth, selectedYear]);

  // Financial Health Score (0-100)
  const financialHealthScore = useMemo(() => {
    if (!monthlySummary || !budgets || budgets.length === 0) return null;
    
    let score = 50; // Base score
    
    // Savings rate component (0-30 points)
    const savingsRate = monthlySummary.savingsRate;
    if (savingsRate >= 20) score += 30;
    else if (savingsRate >= 10) score += 20;
    else if (savingsRate >= 5) score += 10;
    else if (savingsRate < 0) score -= 20;
    
    // Budget adherence component (0-30 points)
    const budgetSummary = budgets.reduce((sum, budget) => {
      const amount = typeof budget.amount === 'string' ? parseFloat(budget.amount) : budget.amount || 0;
      const spent = typeof budget.spent === 'string' ? parseFloat(budget.spent) : budget.spent || 0;
      return { total: sum.total + amount, spent: sum.spent + spent };
    }, { total: 0, spent: 0 });
    
    const budgetUtilization = budgetSummary.total > 0 ? (budgetSummary.spent / budgetSummary.total) * 100 : 0;
    if (budgetUtilization <= 80) score += 30;
    else if (budgetUtilization <= 100) score += 15;
    else score -= 15;
    
    // Income stability component (0-20 points)
    if (monthlySummary.income > 0) score += 20;
    
    // Expense control component (0-20 points)
    if (expenseGrowth <= 5) score += 20;
    else if (expenseGrowth <= 10) score += 10;
    else if (expenseGrowth > 20) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }, [monthlySummary, budgets, expenseGrowth]);

  // Category distribution for pie chart
  const categoryChartData = useMemo(() => {
    if (!categorySpending || categorySpending.length === 0) return null;
    
    const colors = colorMode === 'dark' 
      ? ['#4299E1', '#F6AD55', '#48BB78', '#ED8936', '#9F7AEA', '#38B2AC', '#F56565']
      : ['#0073E6', '#FFC441', '#10B981', '#F59E0B', '#8B5CF6', '#14B8A6', '#EF4444'];
    
    return {
      labels: categorySpending.map(cat => cat.name),
      datasets: [{
        data: categorySpending.map(cat => cat.amount),
        backgroundColor: colors.slice(0, categorySpending.length),
        borderWidth: 2,
        borderColor: colorMode === 'dark' ? '#1A202C' : '#FFFFFF',
        hoverOffset: 15, // Increase size on hover
      }],
    };
  }, [categorySpending, colorMode]);

  // Top expenses
  const topExpenses = useMemo(() => {
    if (!transactions) return [];
    return transactions
      .filter(t => t.type === 'EXPENSE')
      .slice(0, 5);
  }, [transactions]);

  // Budget performance
  const budgetPerformance = useMemo(() => {
    if (!budgets || budgets.length === 0) return [];
    return budgets.map(budget => {
      const amount = typeof budget.amount === 'string' ? parseFloat(budget.amount) : budget.amount || 0;
      const spent = typeof budget.spent === 'string' ? parseFloat(budget.spent) : budget.spent || 0;
      const utilization = amount > 0 ? (spent / amount) * 100 : 0;
      return {
        name: budget.category?.name || 'Uncategorized',
        budget: amount,
        spent,
        utilization,
      };
    }).sort((a, b) => b.utilization - a.utilization).slice(0, 5);
  }, [budgets]);

  // Generate month options
  const months = createListCollection({
    items: Array.from({ length: 12 }, (_, i) => ({
      value: (i + 1).toString(),
      label: format(new Date(2024, i, 1), 'MMMM'),
    })),
  });

  // Generate year options (current year and 2 years back)
  const currentYear = new Date().getFullYear();
  const years = createListCollection({
    items: Array.from({ length: 3 }, (_, i) => ({
      value: (currentYear - i).toString(),
      label: (currentYear - i).toString(),
    })),
  });

  return (
    <DashboardLayout>
      <VStack align="stretch" gap={{ base: 4, lg: 6 }}>
        <HStack justify="space-between" align="center" flexDirection={{ base: 'column', lg: 'row' }} alignSelf={{ base: 'stretch', lg: 'auto' }} gap={{ base: 3, lg: 0 }}>
          <Box textAlign={{ base: 'center', lg: 'left' }}>
            <Heading size={{ base: '2xl', lg: '4xl' }} color="text-primary" fontWeight="bold">
              Analytics
            </Heading>
            <Text fontSize={{ base: 'sm', lg: 'lg' }} color="text-secondary" mt={{ base: 1, lg: 2 }}>
              Deep insights and financial trends
            </Text>
          </Box>
          <HStack gap={{ base: 1.5, lg: 2 }} w={{ base: '100%', lg: 'auto' }} justify={{ base: 'center', lg: 'flex-end' }}>
            <Select.Root
              collection={months}
              value={[selectedMonth.toString()]}
              onValueChange={(details) => {
                const newMonth = details.value[0];
                if (newMonth) setSelectedMonth(parseInt(newMonth));
              }}
              size="sm"
              w={{ base: '100%', lg: '140px' }}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Select month" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Select.Positioner>
                <Select.Content>
                  {months.items.map((month) => (
                    <Select.Item item={month} key={month.value}>
                      {month.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Select.Root>
            <Select.Root
              collection={years}
              value={[selectedYear.toString()]}
              onValueChange={(details) => {
                const newYear = details.value[0];
                if (newYear) setSelectedYear(parseInt(newYear));
              }}
              size="sm"
              w={{ base: '100%', lg: '100px' }}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Year" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Select.Positioner>
                <Select.Content>
                  {years.items.map((year) => (
                    <Select.Item item={year} key={year.value}>
                      {year.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Select.Root>
          </HStack>
        </HStack>

        {/* Financial Health Score & Key Metrics */}
        {isLoadingSummary ? (
          <Grid templateColumns={{ base: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={{ base: 3, lg: 4 }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height={{ base: '100px', lg: '120px' }} borderRadius="12px" />
            ))}
          </Grid>
        ) : monthlySummary ? (
          <Grid templateColumns={{ base: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={{ base: 3, lg: 4 }}>
            {/* Financial Health Score */}
            <Box bg="bg-card" p={{ base: 3, lg: 4 }} borderRadius="12px" boxShadow="shadow-card" position="relative" overflow="hidden">
              <VStack align="stretch" gap={{ base: 1.5, lg: 2 }}>
                <HStack justify="space-between">
                  <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-secondary" fontWeight="medium">
                    Health Score
                  </Text>
                  <Target size={16} color={financialHealthScore && financialHealthScore >= 70 ? '#10B981' : financialHealthScore && financialHealthScore >= 50 ? '#F59E0B' : '#EF4444'} />
                </HStack>
                <Text fontSize={{ base: '2xl', lg: '3xl' }} fontWeight="bold" color={financialHealthScore && financialHealthScore >= 70 ? 'green.500' : financialHealthScore && financialHealthScore >= 50 ? 'orange.500' : 'red.500'}>
                  {financialHealthScore !== null ? Math.round(financialHealthScore) : 'N/A'}
                </Text>
                <Text fontSize={{ base: '2xs', lg: 'xs' }} color="text-muted">
                  {financialHealthScore !== null && financialHealthScore >= 70 ? 'Excellent' : financialHealthScore !== null && financialHealthScore >= 50 ? 'Good' : 'Needs Improvement'}
                </Text>
              </VStack>
            </Box>

            {/* Spending Velocity */}
            <Box bg="bg-card" p={{ base: 3, lg: 4 }} borderRadius="12px" boxShadow="shadow-card">
              <VStack align="stretch" gap={{ base: 1.5, lg: 2 }}>
                <HStack justify="space-between">
                  <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-secondary" fontWeight="medium">
                    Daily Spending
                  </Text>
                  <Zap size={16} color="#F59E0B" />
                </HStack>
                <Text fontSize={{ base: 'xl', lg: '2xl' }} fontWeight="bold" color="text-primary">
                  {formatAmount(spendingVelocity)}
                </Text>
                <Text fontSize={{ base: '2xs', lg: 'xs' }} color="text-muted">
                  Average per day
                </Text>
              </VStack>
            </Box>

            {/* Month-over-Month Income Growth */}
            <Box bg="bg-card" p={{ base: 3, lg: 4 }} borderRadius="12px" boxShadow="shadow-card">
              <VStack align="stretch" gap={{ base: 1.5, lg: 2 }}>
                <HStack justify="space-between">
                  <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-secondary" fontWeight="medium">
                    Income Growth
                  </Text>
                  {incomeGrowth >= 0 ? (
                    <TrendingUp size={16} color="#10B981" />
                  ) : (
                    <TrendingDown size={16} color="#EF4444" />
                  )}
                </HStack>
                <Text fontSize={{ base: 'xl', lg: '2xl' }} fontWeight="bold" color={incomeGrowth >= 0 ? 'green.500' : 'red.500'}>
                  {incomeGrowth >= 0 ? '+' : ''}{incomeGrowth.toFixed(1)}%
                </Text>
                <Text fontSize={{ base: '2xs', lg: 'xs' }} color="text-muted">
                  vs last month
                </Text>
              </VStack>
            </Box>

            {/* Month-over-Month Expense Growth */}
            <Box bg="bg-card" p={{ base: 3, lg: 4 }} borderRadius="12px" boxShadow="shadow-card">
              <VStack align="stretch" gap={{ base: 1.5, lg: 2 }}>
                <HStack justify="space-between">
                  <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-secondary" fontWeight="medium">
                    Expense Growth
                  </Text>
                  {expenseGrowth <= 0 ? (
                    <TrendingDown size={16} color="#10B981" />
                  ) : (
                    <TrendingUp size={16} color="#EF4444" />
                  )}
                </HStack>
                <Text fontSize={{ base: 'xl', lg: '2xl' }} fontWeight="bold" color={expenseGrowth <= 0 ? 'green.500' : 'red.500'}>
                  {expenseGrowth >= 0 ? '+' : ''}{expenseGrowth.toFixed(1)}%
                </Text>
                <Text fontSize={{ base: '2xs', lg: 'xs' }} color="text-muted">
                  vs last month
                </Text>
              </VStack>
            </Box>
          </Grid>
        ) : null}

        {/* Year-over-Year Comparison */}
        {monthlySummary && yoySummary && (
          <Box bg="bg-card" p={{ base: 4, lg: 6 }} borderRadius="12px" boxShadow="shadow-card">
            <VStack align="stretch" gap={{ base: 3, lg: 4 }}>
              <Heading size={{ base: 'md', lg: 'lg' }} color="text-primary" fontWeight="bold">
                Year-over-Year Comparison
              </Heading>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={{ base: 3, lg: 4 }}>
                <Box p={{ base: 3, lg: 4 }} bg="bg-secondary" borderRadius="8px">
                  <VStack align="stretch" gap={2}>
                    <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-secondary" fontWeight="medium">
                      Income YoY Change
                    </Text>
                    <HStack justify="space-between" align="center">
                      <Text fontSize={{ base: 'xl', lg: '2xl' }} fontWeight="bold" color={yoyIncomeChange >= 0 ? 'green.500' : 'red.500'}>
                        {yoyIncomeChange >= 0 ? '+' : ''}{yoyIncomeChange.toFixed(1)}%
                      </Text>
                      <HStack gap={1}>
                        <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-muted">
                          This year: {formatAmount(monthlySummary.income)}
                        </Text>
                      </HStack>
                    </HStack>
                    <Text fontSize={{ base: '2xs', lg: 'xs' }} color="text-muted">
                      Last year: {formatAmount(yoySummary.income)}
                    </Text>
                  </VStack>
                </Box>
                <Box p={{ base: 3, lg: 4 }} bg="bg-secondary" borderRadius="8px">
                  <VStack align="stretch" gap={2}>
                    <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-secondary" fontWeight="medium">
                      Expenses YoY Change
                    </Text>
                    <HStack justify="space-between" align="center">
                      <Text fontSize={{ base: 'xl', lg: '2xl' }} fontWeight="bold" color={yoyExpenseChange <= 0 ? 'green.500' : 'red.500'}>
                        {yoyExpenseChange >= 0 ? '+' : ''}{yoyExpenseChange.toFixed(1)}%
                      </Text>
                      <HStack gap={1}>
                        <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-muted">
                          This year: {formatAmount(monthlySummary.expenses)}
                        </Text>
                      </HStack>
                    </HStack>
                    <Text fontSize={{ base: '2xs', lg: 'xs' }} color="text-muted">
                      Last year: {formatAmount(yoySummary.expenses)}
                    </Text>
                  </VStack>
                </Box>
              </Grid>
            </VStack>
          </Box>
        )}

        {/* Category Distribution & Top Expenses */}
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={{ base: 3, lg: 4 }}>
          {/* Category Distribution Pie Chart */}
          <Box bg="bg-card" p={{ base: 4, lg: 6 }} borderRadius="12px" boxShadow="shadow-card">
            <VStack align="stretch" gap={{ base: 3, lg: 4 }}>
              <Heading size={{ base: 'md', lg: 'lg' }} color="text-primary" fontWeight="bold">
                Spending by Category
              </Heading>
              {isLoadingCategory ? (
                <Skeleton height={{ base: '250px', lg: '300px' }} borderRadius="8px" />
              ) : categoryChartData ? (
                <Box height={{ base: '250px', lg: '300px' }}>
                  <Doughnut
                    data={categoryChartData}
                    plugins={[createDoughnutLabelPlugin(colorMode)]}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: {
                        intersect: false,
                      },
                      onHover: (event, activeElements) => {
                        const canvas = event.native?.target as HTMLCanvasElement;
                        if (canvas) {
                          canvas.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
                        }
                      },
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            color: colorMode === 'dark' ? '#E2E8F0' : '#2D3748',
                            font: { size: 12 },
                            padding: 15,
                          },
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              const label = context.label || '';
                              const value = context.parsed || 0;
                              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                              const percentage = ((value / total) * 100).toFixed(1);
                              return `${label}: ${formatAmount(value)} (${percentage}%)`;
                            },
                          },
                        },
                      },
                      animation: {
                        animateRotate: true,
                        animateScale: true,
                      },
                    }}
                  />
                </Box>
              ) : (
                <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-muted" textAlign="center" py={4}>
                  No category data available
                </Text>
              )}
            </VStack>
          </Box>

          {/* Top Expenses */}
          <Box bg="bg-card" p={{ base: 4, lg: 6 }} borderRadius="12px" boxShadow="shadow-card">
            <VStack align="stretch" gap={{ base: 3, lg: 4 }}>
              <Heading size={{ base: 'md', lg: 'lg' }} color="text-primary" fontWeight="bold">
                Top Expenses
              </Heading>
              {topExpenses.length > 0 ? (
                <VStack gap={2} align="stretch">
                  {topExpenses.map((expense, index) => (
                    <HStack key={expense.id} justify="space-between" p={{ base: 2.5, lg: 3 }} bg="bg-secondary" borderRadius="8px">
                      <VStack align="start" gap={0}>
                        <HStack gap={2}>
                          <Box
                            bg={colorMode === 'dark' ? 'whiteAlpha.200' : 'blackAlpha.100'}
                            borderRadius="full"
                            w={6}
                            h={6}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Text fontSize="xs" fontWeight="bold" color="text-primary">
                              {index + 1}
                            </Text>
                          </Box>
                          <Text fontSize={{ base: 'xs', lg: 'sm' }} fontWeight="medium" color="text-primary" maxW="200px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                            {expense.description || expense.category?.name || 'Expense'}
                          </Text>
                        </HStack>
                        <Text fontSize={{ base: '2xs', lg: 'xs' }} color="text-muted" ml={8}>
                          {expense.category?.name || 'Uncategorized'}
                        </Text>
                      </VStack>
                      <Text fontSize={{ base: 'xs', lg: 'sm' }} fontWeight="bold" color="red.500">
                        {formatAmount(typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount)}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              ) : (
                <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-muted" textAlign="center" py={4}>
                  No expenses found
                </Text>
              )}
            </VStack>
          </Box>
        </Grid>

        {/* Budget Performance */}
        {budgets && budgets.length > 0 && (
          <Box bg="bg-card" p={{ base: 4, lg: 6 }} borderRadius="12px" boxShadow="shadow-card">
            <VStack align="stretch" gap={{ base: 3, lg: 4 }}>
              <Heading size={{ base: 'md', lg: 'lg' }} color="text-primary" fontWeight="bold">
                Budget Performance
              </Heading>
              {isLoadingBudgets ? (
                <VStack gap={2}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} height={{ base: '50px', lg: '60px' }} width="100%" borderRadius="8px" />
                  ))}
                </VStack>
              ) : budgetPerformance.length > 0 ? (
                <VStack gap={{ base: 2, lg: 3 }} align="stretch">
                  {budgetPerformance.map((budget, index) => (
                    <Box key={index} p={{ base: 2.5, lg: 3 }} bg="bg-secondary" borderRadius="8px">
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize={{ base: 'xs', lg: 'sm' }} fontWeight="medium" color="text-primary">
                          {budget.name}
                        </Text>
                        <Text fontSize={{ base: 'xs', lg: 'sm' }} fontWeight="bold" color={budget.utilization > 100 ? 'red.500' : budget.utilization > 80 ? 'orange.500' : 'green.500'}>
                          {budget.utilization.toFixed(0)}%
                        </Text>
                      </HStack>
                      <Box bg="bg-progress-default" borderRadius="full" height={{ base: '6px', lg: '8px' }} overflow="hidden" mb={1}>
                        <Box
                          bg={budget.utilization > 100 ? 'red.500' : budget.utilization > 80 ? 'orange.500' : 'green.500'}
                          height="100%"
                          width={`${Math.min(budget.utilization, 100)}%`}
                          transition="width 0.3s ease"
                        />
                      </Box>
                      <HStack justify="space-between" mt={1}>
                        <Text fontSize={{ base: '2xs', lg: 'xs' }} color="text-muted">
                          Spent: {formatAmount(budget.spent)}
                        </Text>
                        <Text fontSize={{ base: '2xs', lg: 'xs' }} color="text-muted">
                          Budget: {formatAmount(budget.budget)}
                        </Text>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              ) : (
                <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-muted" textAlign="center" py={4}>
                  No budget data available
                </Text>
              )}
            </VStack>
          </Box>
        )}
      </VStack>
    </DashboardLayout>
  );
}
