'use client';

import { useMemo } from 'react';
import { Box, Heading, Text, VStack, HStack, Skeleton } from '@chakra-ui/react';
import { useTransactions } from '@/hooks/useTransactions';
import { useAnalyticsDateStore } from '@/hooks/useAnalyticsDateStore';
import { useCurrency } from '@/hooks/useCurrency';
import { format } from 'date-fns';

export const TopExpenses = () => {
  const { startDate, endDate } = useAnalyticsDateStore();
  const { formatAmount } = useCurrency();
  
  const { transactions, isLoading } = useTransactions({
    startDate,
    endDate,
  });

  const topExpenses = useMemo(() => {
    if (!transactions) return [];
    return transactions
      .filter(t => t.type === 'EXPENSE')
      .slice(0, 5);
  }, [transactions]);

  return (
    <Box bg="bg-card" p={{ base: 4, lg: 6 }} borderRadius="12px" boxShadow="shadow-card">
      <VStack align="stretch" gap={{ base: 3, lg: 4 }}>
        <Heading size={{ base: 'md', lg: 'lg' }} color="text-primary" fontWeight="bold">
          Top Expenses
        </Heading>
        {isLoading ? (
          <Skeleton height="200px" borderRadius="8px" />
        ) : topExpenses.length > 0 ? (
          <VStack align="stretch" gap={2}>
            {topExpenses.map((expense) => (
              <HStack
                key={expense.id}
                justify="space-between"
                p={3}
                bg="bg-subtle"
                borderRadius="8px"
                _hover={{ bg: 'bg-muted' }}
                transition="background 0.2s"
              >
                <VStack align="start" gap={0.5}>
                  <Text fontSize={{ base: 'xs', lg: 'sm' }} fontWeight="medium" color="text-primary">
                    {expense.description || expense.category?.name}
                  </Text>
                  <Text fontSize={{ base: '2xs', lg: 'xs' }} color="text-muted">
                    {format(new Date(expense.date), 'MMM dd, yyyy')}
                  </Text>
                </VStack>
                <Text fontSize={{ base: 'xs', lg: 'sm' }} fontWeight="bold" color="red.500">
                  {formatAmount(Number(expense.amount))}
                </Text>
              </HStack>
            ))}
          </VStack>
        ) : (
          <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-muted" textAlign="center" py={4}>
            No expenses recorded
          </Text>
        )}
      </VStack>
    </Box>
  );
};

