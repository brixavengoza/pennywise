'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Box, Heading, Text, VStack, Grid, Skeleton } from '@chakra-ui/react';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { IncomeExpensesChart } from '@/components/dashboard/IncomeExpensesChart';
import { BudgetSummary } from '@/components/dashboard/BudgetSummary';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { TopCategories } from '@/components/dashboard/TopCategories';
import { useAuth } from '@/hooks/useAuth';
import { useGetMonthlySummary } from '@/hooks/useRequest';
import { useBudgets } from '@/hooks/useBudgets';
import { Budget } from '@/types';

export default function Home() {
  const { user } = useAuth();
  const userName = user?.name || 'User';

  const { data: monthlySummary, isLoading: monthlySummaryLoading } = useGetMonthlySummary();
  const { budgets, isLoading: budgetsLoading } = useBudgets();

  console.log({monthlySummary, budgets})
  const totalBalance = monthlySummary 
    ? (monthlySummary.income || 0) - (monthlySummary.expenses || 0)
    : 0;

  const monthlyIncome = monthlySummary?.income || 0;
  const monthlyExpenses = monthlySummary?.expenses || 0;

  const totalBudget = budgets.reduce((sum: number, budget: Budget) => {
    const amount = typeof budget.amount === 'string' ? parseFloat(budget.amount) : (budget.amount || 0);
    return sum + amount;
  }, 0);
  const totalSpent = budgets.reduce((sum: number, budget: Budget) => {
    const spent = typeof budget.spent === 'string' ? parseFloat(budget.spent) : (budget.spent || 0);
    return sum + spent;
  }, 0);
  const remaining = totalBudget - totalSpent;

  return (
    <DashboardLayout>
      <VStack align="stretch" gap={{ base: 4, lg: 6 }}>
        <Box>
          <Heading size={{ base: '2xl', lg: '4xl' }} color="text-primary" fontWeight="bold">
            Hello <Box as="span" color="text-muted">{userName.split(' ')[0]}</Box>
          </Heading>
          <Text fontSize={{ base: 'lg', lg: '3xl' }} color="text-secondary" mt={{ base: 1, lg: 0 }}>
            <Box as="span" color="text-muted">Please review</Box> today&apos;s activity
          </Text>
        </Box>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={{ base: 3, lg: 4 }}>
          {monthlySummaryLoading ? (
            <>
              <Skeleton height="172px" borderRadius="8px" />
              <Skeleton height="172px" borderRadius="8px" />
              <Skeleton height="172px" borderRadius="8px" />
              <Skeleton height="172px" borderRadius="8px" />
            </>
          ) : (
            <>
              <BalanceCard
                label="Total Balance"
                amount={totalBalance}
                variant="dark"
                showButtons
              />
              <BalanceCard
                label="Monthly Income"
                amount={monthlyIncome}
                variant="blue"
              />
              <BalanceCard
                label="Monthly Expenses"
                amount={monthlyExpenses}
                variant="grey"
              />
              <BalanceCard
                label="Quick transfer"
                subtitle="Move money instantly"
                buttonLabel="Transfer"
                variant="white"
              />
            </>
          )}
        </Grid>

        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={{ base: 3, lg: 4 }}>
          <IncomeExpensesChart />
          {budgetsLoading && !budgets.length ? (
            <Skeleton height={{ base: '300px', lg: '400px' }} borderRadius="8px" />
          ) : (
            <BudgetSummary 
              totalBudget={totalBudget}
              totalSpent={totalSpent}
              remaining={remaining}
            />
          )}
        </Grid>

        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={{ base: 3, lg: 4 }}>
          <RecentTransactions />
          <TopCategories />
        </Grid>
      </VStack>
    </DashboardLayout>
  );
}
