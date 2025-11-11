'use client';

import { useMemo } from 'react';
import { Box, Heading, Text, VStack, HStack, Skeleton, Badge } from '@chakra-ui/react';
import { useMonthlySummary } from '@/hooks/useMonthlySummary';
import { useAnalyticsDateStore } from '@/hooks/useAnalyticsDateStore';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const YearOverYearComparison = () => {
  const { selectedMonth, selectedYear } = useAnalyticsDateStore();

  const { monthlySummary } = useMonthlySummary({
    month: selectedMonth,
    year: selectedYear,
  });

  const { monthlySummary: yoySummary, isLoading } = useMonthlySummary({
    month: selectedMonth,
    year: selectedYear - 1,
  });

  const yoyComparison = useMemo(() => {
    if (!monthlySummary || !yoySummary) return null;

    const currentIncome = monthlySummary.income || 0;
    const currentExpenses = monthlySummary.expenses || 0;
    const prevIncome = yoySummary.income || 0;
    const prevExpenses = yoySummary.expenses || 0;

    const incomeChange = prevIncome > 0 ? ((currentIncome - prevIncome) / prevIncome) * 100 : 0;
    const expenseChange = prevExpenses > 0 ? ((currentExpenses - prevExpenses) / prevExpenses) * 100 : 0;

    return { incomeChange, expenseChange };
  }, [monthlySummary, yoySummary]);

  return (
    <Box bg="bg-card" p={{ base: 4, lg: 6 }} borderRadius="12px" boxShadow="shadow-card">
      <VStack align="stretch" gap={{ base: 3, lg: 4 }}>
        <Heading size={{ base: 'md', lg: 'lg' }} color="text-primary" fontWeight="bold">
          Year-over-Year Comparison
        </Heading>
        {isLoading ? (
          <Skeleton height="100px" borderRadius="8px" />
        ) : yoyComparison ? (
          <VStack align="stretch" gap={3}>
            <HStack justify="space-between" p={3} bg="bg-subtle" borderRadius="8px">
              <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-secondary">Income Change</Text>
              <HStack>
                {yoyComparison.incomeChange >= 0 ? (
                  <TrendingUp size={16} color="#10B981" />
                ) : (
                  <TrendingDown size={16} color="#EF4444" />
                )}
                <Badge colorScheme={yoyComparison.incomeChange >= 0 ? 'green' : 'red'}>
                  {yoyComparison.incomeChange >= 0 ? '+' : ''}{yoyComparison.incomeChange.toFixed(1)}%
                </Badge>
              </HStack>
            </HStack>
            <HStack justify="space-between" p={3} bg="bg-subtle" borderRadius="8px">
              <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-secondary">Expense Change</Text>
              <HStack>
                {yoyComparison.expenseChange <= 0 ? (
                  <TrendingDown size={16} color="#10B981" />
                ) : (
                  <TrendingUp size={16} color="#EF4444" />
                )}
                <Badge colorScheme={yoyComparison.expenseChange <= 0 ? 'green' : 'red'}>
                  {yoyComparison.expenseChange >= 0 ? '+' : ''}{yoyComparison.expenseChange.toFixed(1)}%
                </Badge>
              </HStack>
            </HStack>
          </VStack>
        ) : (
          <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-muted" textAlign="center" py={4}>
            No comparison data available
          </Text>
        )}
      </VStack>
    </Box>
  );
};

