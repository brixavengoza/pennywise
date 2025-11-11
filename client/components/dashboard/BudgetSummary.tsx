'use client';

import { Box, Text, HStack, VStack, Skeleton } from '@chakra-ui/react';
import { Select } from '@chakra-ui/react';
import { createListCollection } from '@chakra-ui/react';
import { useCurrency } from '@/hooks/useCurrency';
import { useState, useMemo } from 'react';
import { useBudgets } from '@/hooks/useBudgets';

const periods = createListCollection({
  items: [
    { value: 'monthly', label: 'Monthly' },
    { value: 'annual', label: 'Annual' },
  ],
});

interface BudgetSummaryProps {
  totalBudget?: number;
  totalSpent?: number;
  remaining?: number;
}

export function BudgetSummary({ 
  totalBudget: initialTotalBudget = 0, 
  totalSpent: initialTotalSpent = 0, 
  remaining: _initialRemaining = 0 
}: BudgetSummaryProps) {
  const { symbol } = useCurrency();
  const [period, setPeriod] = useState<'monthly' | 'annual'>('monthly');
  
  // Memoize budget params to prevent constant refetching
  const budgetParams = useMemo(() => {
    if (period === 'monthly') {
      const currentDate = new Date();
      return {
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
      };
    }
    return undefined;
  }, [period]);
  
  const { budgets, isLoading } = useBudgets(budgetParams);
  console.log({budgets, isLoading})
  const totalBudget = period === 'monthly' 
    ? budgets.reduce((sum, budget) => {
        const amount = typeof budget.amount === 'string' ? parseFloat(budget.amount) : (budget.amount || 0);
        return sum + amount;
      }, 0)
    : initialTotalBudget;
  const totalSpent = period === 'monthly'
    ? budgets.reduce((sum, budget) => {
        const spent = typeof budget.spent === 'string' ? parseFloat(budget.spent) : (budget.spent || 0);
        return sum + spent;
      }, 0)
    : initialTotalSpent;
  const remaining = totalBudget - totalSpent;
  
  const budgetItems = [
    { label: 'Total Budget', amount: totalBudget, color: 'budget-total' },
    { label: 'Spent', amount: totalSpent, color: 'budget-spent' },
    { label: 'Remaining', amount: remaining, color: 'budget-remaining' },
  ];

  const total = totalBudget || 1;
  const remainingPercent = Math.round((remaining / total) * 100);
  const spentPercent = Math.round((totalSpent / total) * 100);
  const unusedPercent = 100 - remainingPercent - spentPercent;
  
  const percentages = [remainingPercent, spentPercent, unusedPercent].filter(p => p > 0);
  const colors = ['budget-remaining', 'budget-spent', 'budget-total'];

  const formatAmount = (value: number) => {
    return `${symbol}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Box bg="bg-card" borderRadius="8px" p={6} boxShadow="shadow-card">
      <HStack justify="space-between" mb={4}>
        <Box
          bg="bg-badge"
          color="text-badge"
          px={3}
          py={1}
          borderRadius="full"
          fontSize="sm"
          fontWeight="medium"
        >
          Budget
        </Box>
        <Select.Root 
          collection={periods} 
          size="sm" 
          width="100px" 
          value={[period]}
          onValueChange={(details) => {
            const newPeriod = details.value[0] as 'monthly' | 'annual';
            if (newPeriod) {
              setPeriod(newPeriod);
            }
          }}
        >
          <Select.HiddenSelect />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Monthly" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Select.Positioner>
            <Select.Content>
              {periods.items.map((item) => (
                <Select.Item item={item} key={item.value}>
                  {item.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </HStack>

      {isLoading && period === 'monthly' ? (
          <VStack h="250px" gap={3} align="stretch">
            {[1, 2, 3].map((i) => (
              <HStack key={i} justify="space-between">
                <HStack gap={2}>
                  <Skeleton boxSize="8px" borderRadius="full" />
                  <Skeleton height="16px" width="100px" />
                </HStack>
                <Skeleton height="16px" width="120px" />
              </HStack>
            ))}
            <Skeleton height="36px" borderRadius="12px" />
          </VStack>
      ) : (
      <>
        <VStack gap={3} mb={6} align="stretch">
          {budgetItems.map((item, index) => (
            <HStack key={index} justify="space-between">
              <HStack gap={2}>
                <Box
                  width="8px"
                  height="8px"
                  borderRadius="full"
                  bg={item.color}
                />
                <Text fontSize="sm" color="text-secondary">
                  {item.label}
                </Text>
              </HStack>
              <Text fontSize="sm" fontWeight="semibold" color="text-primary">
                {formatAmount(item.amount)}
              </Text>
            </HStack>
          ))}
        </VStack>

        <HStack gap={0} borderRadius="12px" overflow="hidden" height="36px" boxShadow="shadow-inset">
          {percentages.map((percentage, index) => (
            <Box
              key={index}
              bg={colors[index]}
              width={`${percentage}%`}
              height="100%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color={index === 0 ? 'text-progress-dark' : 'text-progress-light'}
              fontSize="xs"
              fontWeight="bold"
              position="relative"
              borderRight={index < percentages.length - 1 ? '3px solid' : 'none'}
              borderColor={index < percentages.length - 1 ? 'budget-progress-divider' : 'transparent'}
              boxShadow={index > 0 ? 'budget-progress-shadow' : 'none'}
            >
              {percentage}%
            </Box>
          ))}
        </HStack>
      </>
      )}
    </Box>
  );
}
