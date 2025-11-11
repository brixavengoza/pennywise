'use client';

import { Box, Text, HStack, VStack, Skeleton } from '@chakra-ui/react';
import { Film, ShoppingBag, Heart, Utensils } from 'lucide-react';
import { useCategorySpending } from '@/hooks/useCategorySpending';
import { useBudgets } from '@/hooks/useBudgets';
import { useCurrency } from '@/hooks/useCurrency';
import { Budget } from '@/types';

const iconMap: Record<string, React.ReactNode> = {
  'Entertainment': <Film size={20} />,
  'Shopping': <ShoppingBag size={20} />,
  'Health': <Heart size={20} />,
  'Food': <Utensils size={20} />,
  'Food & Drink': <Utensils size={20} />,
};

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  spent: number;
  budget: number;
  count: number;
  average: number;
}

export function TopCategories() {
  const { symbol } = useCurrency();

  const { categorySpending, isLoading: categorySpendingLoading } = useCategorySpending();
  const { budgets, isLoading: budgetsLoading } = useBudgets();

  const categories = categorySpending
      .slice(0, 5)
      .map((cat: { name: string; amount: number; count?: number; average?: number }) => {
        const budget = budgets.find((b: Budget) => b.category?.name === cat.name);
        return {
          id: cat.name,
          name: cat.name,
          icon: iconMap[cat.name] || <ShoppingBag size={20} />,
          spent: cat.amount || 0,
          budget: budget?.amount || 0,
          count: cat.count || 0,
          average: cat.average || 0,
        };
      })

      console.log({categories})

  const formatAmount = (value: number) => {
    return `${symbol}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const isLoading = categorySpendingLoading || budgetsLoading;

  if (isLoading) {
    return (
      <Box bg="bg-card" borderRadius="8px" p={6} boxShadow="shadow-card">
        <Box
          bg="bg-badge"
          color="text-badge"
          px={3}
          py={1}
          borderRadius="full"
          fontSize="sm"
          fontWeight="medium"
          display="inline-block"
          mb={4}
        >
          Top Categories
        </Box>
        <VStack gap={4} align="stretch">
          {[...Array(5)].map((_, i) => (
            <Box key={i}>
              <HStack justify="space-between" mb={2}>
                <HStack gap={2}>
                  <Skeleton boxSize="20px" borderRadius="4px" />
                  <Skeleton height="16px" width="100px" />
                </HStack>
                <Skeleton height="16px" width="120px" />
              </HStack>
              <Skeleton height="8px" borderRadius="full" />
            </Box>
          ))}
        </VStack>
      </Box>
    );
  }

  if (categories.length === 0) {
    return (
      <Box bg="bg-card" borderRadius="8px" p={6} boxShadow="shadow-card">
        <Box
          bg="bg-badge"
          color="text-badge"
          px={3}
          py={1}
          borderRadius="full"
          fontSize="sm"
          fontWeight="medium"
          display="inline-block"
          mb={4}
        >
          Top Categories
        </Box>
        <Text color="text-muted" textAlign="center" py={8}>
          No category data available
        </Text>
      </Box>
    );
  }

  return (
    <Box bg="bg-card" borderRadius="8px" p={6} boxShadow="shadow-card">
      <Box
        bg="bg-badge"
        color="text-badge"
        px={3}
        py={1}
        borderRadius="full"
        fontSize="sm"
        fontWeight="medium"
        display="inline-block"
        mb={4}
      >
        Top Categories
      </Box>

      <VStack gap={4} align="stretch">
        {categories.map((category) => {
          const percentage = category.budget > 0 
            ? Math.min((category.spent / category.budget) * 100, 100)
            : 0;
          
          return (
            <Box key={category.id}>
              <HStack justify="space-between" mb={2}>
                <HStack gap={2} align="start">
                  <Box color="text-primary" mt={1}>{category.icon}</Box>
                  <VStack align="start" gap={0}>
                    <Text fontSize="sm" fontWeight="medium" color="text-primary">
                      {category.name}
                    </Text>
                    <Text fontSize="xs" color="text-muted">
                      {category.count} {category.count === 1 ? 'transaction' : 'transactions'} • Avg: {formatAmount(category.average)}
                    </Text>
                  </VStack>
                </HStack>
                <VStack align="end" gap={0}>
                  <Text fontSize="sm" fontWeight="semibold" color="text-primary">
                    {formatAmount(category.spent)}
                  </Text>
                  {category.budget > 0 && (
                    <Text fontSize="xs" color="text-muted">
                      / {formatAmount(category.budget)}
                    </Text>
                  )}
                </VStack>
              </HStack>
              <Box
                width="100%"
                height="8px"
                bg="bg-progress-default"
                borderRadius="full"
                overflow="hidden"
              >
                <Box
                  width={`${percentage}%`}
                  height="100%"
                  bg="brand-primary"
                  borderRadius="full"
                  transition="width 0.3s ease"
                />
              </Box>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
}
