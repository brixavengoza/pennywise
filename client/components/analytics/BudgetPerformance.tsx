'use client';

import { useMemo } from 'react';
import { Box, Heading, Text, VStack, HStack, Progress, Skeleton } from '@chakra-ui/react';
import { useBudgets } from '@/hooks/useBudgets';
import { useAnalyticsDateStore } from '@/hooks/useAnalyticsDateStore';
import { useCurrency } from '@/hooks/useCurrency';

export const BudgetPerformance = () => {
  const { selectedMonth, selectedYear } = useAnalyticsDateStore();
  const { formatAmount } = useCurrency();
  
  const { budgets, isLoading: isLoadingBudgets } = useBudgets({
    month: selectedMonth,
    year: selectedYear,
  });

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

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 100) return 'red';
    if (utilization >= 80) return 'yellow';
    return 'green';
  };

  return (
    <Box bg="bg-card" p={{ base: 4, lg: 6 }} borderRadius="12px" boxShadow="shadow-card">
      <VStack align="stretch" gap={{ base: 3, lg: 4 }}>
        <Heading size={{ base: 'md', lg: 'lg' }} color="text-primary" fontWeight="bold">
          Budget Performance
        </Heading>
        {isLoadingBudgets ? (
          <Skeleton height="200px" borderRadius="8px" />
        ) : budgetPerformance.length > 0 ? (
          <VStack align="stretch" gap={3}>
            {budgetPerformance.map((item) => (
              <Box key={item.name}>
                <HStack justify="space-between" mb={1}>
                  <Text fontSize={{ base: 'xs', lg: 'sm' }} fontWeight="medium" color="text-primary">
                    {item.name}
                  </Text>
                  <Text fontSize={{ base: '2xs', lg: 'xs' }} color="text-muted">
                    {formatAmount(item.spent)} / {formatAmount(item.budget)}
                  </Text>
                </HStack>
                <Progress.Root
                  value={Math.min(item.utilization, 100)}
                  colorScheme={getUtilizationColor(item.utilization)}
                  borderRadius="full"
                  size="sm"
                >
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
                <Text fontSize={{ base: '2xs', lg: 'xs' }} color="text-muted" mt={1}>
                  {item.utilization.toFixed(1)}% utilized
                </Text>
              </Box>
            ))}
          </VStack>
        ) : (
          <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-muted" textAlign="center" py={4}>
            No budgets set for this period
          </Text>
        )}
      </VStack>
    </Box>
  );
};

