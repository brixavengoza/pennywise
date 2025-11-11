'use client';

import { useMemo } from 'react';
import { Box, Heading, Text, VStack, HStack, Skeleton, Progress } from '@chakra-ui/react';
import { useMonthlySummary } from '@/hooks/useMonthlySummary';
import { useBudgets } from '@/hooks/useBudgets';
import { useAnalyticsDateStore } from '@/hooks/useAnalyticsDateStore';
import { Zap } from 'lucide-react';

export const FinancialHealthScore = () => {
  const { selectedMonth, selectedYear } = useAnalyticsDateStore();
  
  const { monthlySummary, isLoading: isLoadingSummary } = useMonthlySummary({
    month: selectedMonth,
    year: selectedYear,
  });

  const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
  const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
  
  const { monthlySummary: prevMonthlySummary } = useMonthlySummary({
    month: prevMonth,
    year: prevYear,
  });

  const { budgets } = useBudgets({
    month: selectedMonth,
    year: selectedYear,
  });

  const expenseGrowth = useMemo(() => {
    if (!monthlySummary || !prevMonthlySummary) return 0;
    const current = monthlySummary.expenses || 0;
    const previous = prevMonthlySummary.expenses || 0;
    return previous > 0 ? ((current - previous) / previous) * 100 : 0;
  }, [monthlySummary, prevMonthlySummary]);

  const healthScore = useMemo(() => {
    if (!monthlySummary) return 0;
    
    let score = 50;
    
    const savingsRate = monthlySummary.savingsRate || 0;
    if (savingsRate >= 20) score += 30;
    else if (savingsRate >= 10) score += 20;
    else if (savingsRate >= 5) score += 10;
    else if (savingsRate < 0) score -= 20;
    
    if (budgets && budgets.length > 0) {
      const budgetAdherence = budgets.filter(b => {
        const spent = typeof b.spent === 'string' ? parseFloat(b.spent) : b.spent || 0;
        const amount = typeof b.amount === 'string' ? parseFloat(b.amount) : b.amount || 0;
        return spent <= amount;
      }).length / budgets.length;
      score += budgetAdherence * 20;
    }
    
    if (expenseGrowth < 0) score += 10;
    else if (expenseGrowth > 20) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }, [monthlySummary, budgets, expenseGrowth]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'blue';
    if (score >= 40) return 'yellow';
    return 'red';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <Box bg="bg-card" p={{ base: 4, lg: 6 }} borderRadius="12px" boxShadow="shadow-card">
      <VStack align="stretch" gap={{ base: 3, lg: 4 }}>
        <HStack justify="space-between">
          <Heading size={{ base: 'md', lg: 'lg' }} color="text-primary" fontWeight="bold">
            Financial Health Score
          </Heading>
          <Zap size={20} color="#F59E0B" />
        </HStack>
        {isLoadingSummary ? (
          <Skeleton height="100px" borderRadius="8px" />
        ) : (
          <VStack align="stretch" gap={3}>
            <HStack justify="space-between">
              <Text fontSize={{ base: '2xl', lg: '3xl' }} fontWeight="bold" color={`${getScoreColor(healthScore)}.500`}>
                {healthScore}/100
              </Text>
              <Text fontSize={{ base: 'sm', lg: 'md' }} color="text-secondary" fontWeight="medium">
                {getScoreLabel(healthScore)}
              </Text>
            </HStack>
            <Progress.Root
              value={healthScore}
              colorScheme={getScoreColor(healthScore)}
              borderRadius="full"
              size="lg"
            >
              <Progress.Track>
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
            <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-muted">
              Based on savings rate, budget adherence, and spending trends
            </Text>
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

