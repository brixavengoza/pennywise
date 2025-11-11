'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Box, Heading, Text, VStack, HStack, Grid, IconButton, Select, createListCollection, Skeleton, Stack, Flex } from '@chakra-ui/react';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, AlertCircle, Target } from 'lucide-react';
import { useBudgets } from '@/hooks/useBudgets';
import { usePostRequest, usePutRequest, useDeleteRequest } from '@/hooks/useRequest';
import { useCurrency } from '@/hooks/useCurrency';
import { Button } from '@/components/ui/Button';
import { Budget } from '@/types';
import NiceModal from '@ebay/nice-modal-react';
import BudgetModal from '@/components/budget/BudgetModal';
import DeleteConfirmModal from '@/components/budget/DeleteConfirmModal';
import AddExpenseModal from '@/components/budget/AddExpenseModal';
import { toaster } from '@/components/ui/toaster';
import { format } from 'date-fns';

const months = createListCollection({
  items: Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: format(new Date(2024, i, 1), 'MMMM'),
  })),
});

const years = createListCollection({
  items: Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return {
      value: year.toString(),
      label: year.toString(),
    };
  }),
});

export default function BudgetPage() {
  const { symbol } = useCurrency();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState((currentDate.getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());

  const { budgets, isLoading, mutate } = useBudgets({
    month: parseInt(selectedMonth, 10),
    year: parseInt(selectedYear, 10),
  });

  const postRequest = usePostRequest();
  const putRequest = usePutRequest();
  const deleteRequest = useDeleteRequest();

  // Calculate summary stats
  const summary = useMemo(() => {
    const totalBudget = budgets.reduce((sum, budget) => {
      const amount = typeof budget.amount === 'string' ? parseFloat(budget.amount) : budget.amount;
      return sum + (amount || 0);
    }, 0);
    const totalSpent = budgets.reduce((sum, budget) => {
      const spent = typeof budget.spent === 'string' ? parseFloat(budget.spent) : budget.spent;
      return sum + (spent || 0);
    }, 0);
    const remaining = totalBudget - totalSpent;
    const utilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    return {
      totalBudget,
      totalSpent,
      remaining,
      utilization: Math.min(utilization, 100),
    };
  }, [budgets]);

  // Calculate progress circle values (DRY - reusable)
  const progressUtilization = Math.min(summary.utilization, 100);
  const progressColor = progressUtilization >= 100 ? '#ef4444' : progressUtilization >= 80 ? '#f97316' : '#22c55e';
  // SVG viewBox is 100x100, radius is 42% = 42 units
  const progressRadius = 42;
  const circumference = 2 * Math.PI * progressRadius;
  const progressOffset = circumference * (1 - progressUtilization / 100);

  const formatAmount = (value: number) => {
    return `${symbol}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleCreate = () => {
    NiceModal.show(BudgetModal, {
      budget: null,
      month: parseInt(selectedMonth, 10),
      year: parseInt(selectedYear, 10),
      onSave: handleSave,
    });
  };

  const handleEdit = (budget: Budget) => {
    NiceModal.show(BudgetModal, {
      budget,
      month: parseInt(selectedMonth, 10),
      year: parseInt(selectedYear, 10),
      onSave: handleSave,
    });
  };

  const handleDelete = (budget: Budget) => {
    NiceModal.show(DeleteConfirmModal, {
      budget,
      onConfirm: async () => {
        await handleDeleteConfirm(budget);
      },
    });
  };

  const handleSave = async (
    data: {
      categoryId: string;
      amount: number;
      month: number;
      year: number;
    },
    budget?: Budget | null
  ) => {
    try {
      if (budget) {
        await putRequest(`/api/budget/${budget.id}`, data);
      } else {
        await postRequest('/api/budget', data);
      }
      
      toaster.create({
        title: budget ? 'Budget updated' : 'Budget created',
        type: 'success',
      });
      
      await mutate();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save budget';
      toaster.create({
        title: 'Error',
        description: errorMessage,
        type: 'error',
      });
      throw error;
    }
  };

  const handleDeleteConfirm = async (budget: Budget) => {
    try {
      await deleteRequest(`/api/budget/${budget.id}`);
      toaster.create({
        title: 'Budget deleted',
        type: 'success',
      });
      await mutate();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete budget';
      toaster.create({
        title: 'Error',
        description: errorMessage,
        type: 'error',
      });
    }
  };

  const handleAddExpense = (budget: Budget) => {
    NiceModal.show(AddExpenseModal, {
      budget,
      onSave: async (data) => {
        try {
          await postRequest('/api/transactions', data);
          await mutate(); // Refresh budgets to update spent amount
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to record expense';
          toaster.create({
            title: 'Error',
            description: errorMessage,
            type: 'error',
          });
          throw error;
        }
      },
    });
  };

  const getBudgetStatus = (spent: number, amount: number) => {
    const percentage = (spent / amount) * 100;
    if (percentage >= 100) return { color: 'red.500', icon: <AlertCircle size={16} />, label: 'Over Budget' };
    if (percentage >= 80) return { color: 'orange.500', icon: <TrendingUp size={16} />, label: 'Warning' };
    return { color: 'green.500', icon: <TrendingDown size={16} />, label: 'On Track' };
  };

  return (
    <DashboardLayout>
      <VStack align="stretch" gap={{ base: 4, lg: 6 }}>
        {/* Header */}
        <Flex flexDirection={{ base: 'column', md: 'row' }} justify="space-between" gap={{ base: 3, lg: 5 }} align={{ base: 'stretch', md: 'center' }}> 
          <Box textAlign={{ base: 'center', lg: 'left' }}>
            <Heading size={{ base: '2xl', lg: '4xl' }} color="text-primary" fontWeight="bold">
              Budgets
            </Heading>
            <Text fontSize={{ base: 'lg', lg: '3xl' }} color="text-secondary" mt={{ base: 1, lg: 0 }}>
              Manage your spending limits
            </Text>
          </Box>
          <Button
            bg="button-primary"
            color="button-text"
            borderRadius="18px"
            size="sm"
            fontSize={{ base: 'xs', lg: 'sm' }}
            px={{ base: 3, lg: 4 }}
            py={{ base: 2, lg: 2.5 }}
            onClick={handleCreate}
          >
            <HStack gap={2}>
              <Plus size={16} />
              <Text fontSize={{ base: 'xs', lg: 'sm' }}>Add Budget</Text>
            </HStack>
          </Button>
        </Flex>

        {/* Month/Year Selector */}
        <Box bg="bg-card" borderRadius="8px" p={{ base: 3, lg: 4 }} boxShadow="shadow-card">
          <HStack gap={{ base: 3, lg: 4 }}>
            <Box flex={1}>
              <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-muted" mb={{ base: 1.5, lg: 2 }}>
                Month
              </Text>
              <Select.Root
                collection={months}
                value={[selectedMonth]}
                onValueChange={(details) => {
                  const month = details.value[0];
                  if (month) setSelectedMonth(month);
                }}
              >
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Select.Positioner>
                  <Select.Content>
                    {months.items.map((item) => (
                      <Select.Item item={item} key={item.value}>
                        {item.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Select.Root>
            </Box>
            <Box flex={1}>
              <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-muted" mb={{ base: 1.5, lg: 2 }}>
                Year
              </Text>
              <Select.Root
                collection={years}
                value={[selectedYear]}
                onValueChange={(details) => {
                  const year = details.value[0];
                  if (year) setSelectedYear(year);
                }}
              >
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Select.Positioner>
                  <Select.Content>
                    {years.items.map((item) => (
                      <Select.Item item={item} key={item.value}>
                        {item.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Select.Root>
            </Box>
          </HStack>
        </Box>

        {/* Summary Overview - Unique Design */}
        {isLoading ? (
          <Skeleton height="200px" borderRadius="8px" />
        ) : (
          <Box bg="bg-card" borderRadius="8px" p={{ base: 4, lg: 6 }} boxShadow="shadow-card" position="relative" overflow="hidden">
            {/* Background accent */}
            <Box
              position="absolute"
              top={0} 
              right={0}
              width={{ base: '150px', lg: '300px' }}
              height={{ base: '150px', lg: '300px' }}
              bg="bg-overlay"
              borderRadius="full"
              transform="translate(30%, -30%)"
              opacity={0.3}
            />
            
            <Stack direction={{ base: 'column', lg: 'row' }} gap={{ base: 4, lg: 6 }} position="relative" zIndex={1}>
              {/* Main Summary */}
              <Stack align="start" gap={{ base: 3, md: 2 }} flex={1} justifyContent="space-between">
                <HStack gap={2} mb={{ base: 2, md: 0 }}>
                  <Box
                    bg="bg-badge"
                    color="text-badge"
                    px={{ base: 2, lg: 3 }}
                    py={1}
                    borderRadius="full"
                    fontSize={{ base: '2xs', lg: 'xs' }}
                    fontWeight="medium"
                  >
                    Budget Overview
                  </Box>
                  <Text fontSize={{ base: '2xs', lg: 'xs' }} color="text-muted">
                    {format(new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1), 'MMMM yyyy')}
                  </Text>
                </HStack>
                <HStack w='full' justifyContent="space-between">
                  <Flex flexDirection={{ base: 'column', md: 'row' }} gap={{ base: 4, md: "20px", lg: "70px" }} w="full">
                    <Box>
                      <HStack gap={2} mb={{ base: 1, lg: 0 }}>
                        <Target size={16} color="currentColor" />
                        <Text fontSize={{ base: 'sm', lg: 'lg' }} color="text-muted">
                          Total Budget
                        </Text>
                      </HStack>
                      <Text fontSize={{ base: '2xl', lg: '4xl' }} fontWeight="bold" color="text-primary" lineHeight="1.2">
                        {formatAmount(summary.totalBudget)}
                      </Text>
                    </Box>
                    <Box>
                      <HStack gap={2} mb={{ base: 1, lg: 0 }}>
                        {symbol}
                        <Text fontSize={{ base: 'sm', lg: 'lg' }} color="text-muted">
                          Total Spent
                        </Text>
                      </HStack>
                      <Text fontSize={{ base: '2xl', lg: '4xl' }} fontWeight="bold" color="text-primary">
                        {formatAmount(summary.totalSpent)}
                      </Text>
                    </Box >
                    <Box>
                      <Text fontSize={{ base: 'sm', lg: 'lg' }} color="text-muted" mb={{ base: 1, lg: 0 }}>
                        Remaining
                      </Text>
                      <Text 
                        fontSize={{ base: '2xl', lg: '4xl' }} 
                        fontWeight="bold" 
                        color={summary.remaining >= 0 ? 'green.500' : 'red.500'}
                      >
                        {formatAmount(summary.remaining)}
                      </Text>
                    </Box>
                  </Flex>
                  <Box position="relative" display={{base: "block", lg: "none"}} w='180px' h='180px' flexShrink={0} alignSelf={{ base: 'center', lg: 'auto' }}>
                    <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                      <circle
                        cx="50"
                        cy="50"
                        r={progressRadius}
                        fill="none"
                        stroke="var(--chakra-colors-bg-progress-default)"
                        strokeWidth="6"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r={progressRadius}
                        fill="none"
                        stroke={progressColor}
                        strokeWidth="6"
                        strokeDasharray={circumference}
                        strokeDashoffset={progressOffset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                      />
                    </svg>
                    <VStack
                      position="absolute"
                      top="50%"
                      left="50%"
                      transform="translate(-50%, -50%)"
                      gap={0}
                    >
                      <Text fontSize={{ base: 'md', lg: 'xl' }} fontWeight="bold" color="text-primary">
                        {summary.utilization.toFixed(0)}%
                      </Text>
                      <Text fontSize={{ base: '2xs', lg: 'xs' }} color="text-muted">
                        Used
                      </Text>
                    </VStack>
                  </Box>
                </HStack>
              </Stack>

              {/* Utilization Ring */}
              <Box position="relative" display={{base: "none", lg: "block"}} width={{ base: '80px', lg: '120px' }} height={{ base: '80px', lg: '120px' }} flexShrink={0} alignSelf={{ base: 'center', lg: 'auto' }}>
                <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="50"
                    cy="50"
                    r={progressRadius}
                    fill="none"
                    stroke="var(--chakra-colors-bg-progress-default)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={progressRadius}
                    fill="none"
                    stroke={progressColor}
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={progressOffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                  />
                </svg>
                <VStack
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  gap={0}
                >
                  <Text fontSize={{ base: 'md', lg: 'xl' }} fontWeight="bold" color="text-primary">
                    {summary.utilization.toFixed(0)}%
                  </Text>
                  <Text fontSize={{ base: '2xs', lg: 'xs' }} color="text-muted">
                    Used
                  </Text>
                </VStack>
              </Box>
            </Stack>
          </Box>
        )}

        {/* Budget List */}
        <Box bg="bg-card" borderRadius="8px" p={{ base: 3, lg: 6 }} boxShadow="shadow-card">
          <HStack justify="space-between" mb={{ base: 3, lg: 4 }}>
            <Heading size={{ base: 'md', lg: 'lg' }} color="text-primary">
              Budgets by Category
            </Heading>
            <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-muted">
              {budgets.length} {budgets.length === 1 ? 'budget' : 'budgets'}
            </Text>
          </HStack>

          {isLoading ? (
            <VStack gap={4} align="stretch">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height="120px" borderRadius="8px" />
              ))}
            </VStack>
          ) : budgets.length === 0 ? (
            <Box textAlign="center" py={12}>
              <Text color="text-muted" fontSize={{ base: 'md', lg: 'lg' }} mb={4}>
                No budgets for {format(new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1), 'MMMM yyyy')}
              </Text>
              <Button
                bg="button-primary"
                color="button-text"
                borderRadius="18px"
                size="sm"
                fontSize={{ base: 'xs', lg: 'sm' }}
                px={{ base: 3, lg: 4 }}
                py={{ base: 2, lg: 2.5 }}
                onClick={handleCreate}
              >
                <HStack gap={2}>
                  <Plus size={16} />
                  <Text fontSize={{ base: 'xs', lg: 'sm' }}>Create Your First Budget</Text>
                </HStack>
              </Button>
            </Box>
          ) : (
            <VStack gap={{ base: 3, lg: 4 }} align="stretch">
              {budgets.map((budget: Budget) => {
                const spent = typeof budget.spent === 'string' ? parseFloat(budget.spent) : (budget.spent || 0);
                const amount = typeof budget.amount === 'string' ? parseFloat(budget.amount) : (budget.amount || 0);
                const percentage = amount > 0 ? Math.min((spent / amount) * 100, 100) : 0;
                const remaining = amount - spent;
                const status = getBudgetStatus(spent, amount);

                return (
                  <Box
                    key={budget.id}
                    bg="bg-overlay"
                    borderRadius="12px"
                    p={{ base: 3, lg: 5 }}
                    _hover={{ bg: 'bg-hover' }}
                    transition="all 0.2s"
                  >
                    <VStack gap={3} align="stretch" display={{ base: 'flex', md: 'none' }}>
                      {/* Mobile Layout */}
                      <HStack justify="space-between" align="start">
                        <VStack align="start" gap={1} flex={1}>
                          <HStack gap={2} flexWrap="wrap">
                            <Box
                              bg="bg-badge"
                              color="text-badge"
                              px={{ base: 2, lg: 3 }}
                              py={1}
                              borderRadius="full"
                              fontSize={{ base: 'xs', lg: 'sm' }}
                              fontWeight="medium"
                            >
                              {budget.category?.name || 'Uncategorized'}
                            </Box>
                            <HStack gap={1} color={status.color}>
                              {status.icon}
                              <Text fontSize={{ base: '2xs', lg: 'xs' }} fontWeight="medium">
                                {status.label}
                              </Text>
                            </HStack>
                          </HStack>
                        </VStack>
                      </HStack>
                      <Box width="100%">
                        <Box
                          width="100%"
                          height="6px"
                          bg="bg-progress-default"
                          borderRadius="full"
                          overflow="hidden"
                          position="relative"
                        >
                          <Box
                            width={`${percentage}%`}
                            height="100%"
                            bg={percentage >= 100 ? 'red.500' : percentage >= 80 ? 'orange.500' : 'green.500'}
                            borderRadius="full"
                            transition="width 0.3s ease"
                          />
                        </Box>
                      </Box>
                      <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                        <VStack align="start" gap={0}>
                          <Text fontSize={{ base: '2xs', lg: 'xs' }} color="text-muted">
                            Budget
                          </Text>
                          <Text fontSize={{ base: 'md', lg: 'lg' }} fontWeight="bold" color="text-primary">
                            {formatAmount(amount)}
                          </Text>
                        </VStack>
                        <VStack align="start" gap={0}>
                          <Text fontSize={{ base: '2xs', lg: 'xs' }} color="text-muted">
                            Spent
                          </Text>
                          <Text fontSize={{ base: 'md', lg: 'lg' }} fontWeight="semibold" color="text-primary">
                            {formatAmount(spent)}
                          </Text>
                        </VStack>
                      </Grid>
                      <Text 
                        fontSize={{ base: 'xs', lg: 'sm' }} 
                        fontWeight="medium"
                        color={remaining >= 0 ? 'green.500' : 'red.500'}
                      >
                        {remaining >= 0 ? 'Remaining' : 'Over'}: {formatAmount(Math.abs(remaining))}
                      </Text>
                      <HStack gap={1} justify="flex-end">
                        <Button
                          size="sm"
                          variant="outline"
                          fontSize={{ base: 'xs', lg: 'sm' }}
                          px={{ base: 2, lg: 3 }}
                          py={{ base: 1.5, lg: 2 }}
                          onClick={() => handleAddExpense(budget)}
                        >
                          <Plus size={12} style={{ marginRight: '4px' }} />
                          <Text fontSize={{ base: 'xs', lg: 'sm' }}>Add Expense</Text>
                        </Button>
                        <IconButton
                          aria-label="Edit budget"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(budget)}
                        >
                          <Edit size={14} />
                        </IconButton>
                        <IconButton
                          aria-label="Delete budget"
                          variant="ghost"
                          size="sm"
                          colorPalette="red"
                          onClick={() => handleDelete(budget)}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </HStack>
                    </VStack>

                    {/* Desktop Layout */}
                    <Grid templateColumns={{ base: '1fr', md: '2fr 1fr 1fr auto' }} gap={4} alignItems="center" display={{ base: 'none', md: 'grid' }}>
                      {/* Category and Status */}
                      <VStack align="start" gap={1}>
                        <HStack gap={2} justifyContent={"space-between"}>
                          <Box
                            bg="bg-badge"
                            color="text-badge"
                            px={3}
                            py={1}
                            borderRadius="full"
                            fontSize="sm"
                            fontWeight="medium"
                          >
                            {budget.category?.name || 'Uncategorized'}
                          </Box>
                          <HStack gap={1} color={status.color}>
                            {status.icon}
                            <Text fontSize="xs" fontWeight="medium">
                              {status.label}
                            </Text>
                          </HStack>
                        </HStack>
                        <Box width="100%" mt={2}>
                          <Box
                            width="100%"
                            height="8px"
                            bg="bg-progress-default"
                            borderRadius="full"
                            overflow="hidden"
                            position="relative"
                          >
                            <Box
                              width={`${percentage}%`}
                              height="100%"
                              bg={percentage >= 100 ? 'red.500' : percentage >= 80 ? 'orange.500' : 'green.500'}
                              borderRadius="full"
                              transition="width 0.3s ease"
                            />
                          </Box>
                        </Box>
                      </VStack>

                      {/* Budget Amount */}
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" color="text-muted">
                          Budget
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color="text-primary">
                          {formatAmount(amount)}
                        </Text>
                      </VStack>

                      {/* Spent and Remaining */}
                      <VStack align="start" gap={0}>
                        <Text fontSize="xs" color="text-muted">
                          Spent
                        </Text>
                        <Text fontSize="lg" fontWeight="semibold" color="text-primary">
                          {formatAmount(spent)}
                        </Text>
                        <Text 
                          fontSize="xs" 
                          fontWeight="medium"
                          color={remaining >= 0 ? 'green.500' : 'red.500'}
                          mt={1}
                        >
                          {remaining >= 0 ? 'Remaining' : 'Over'}: {formatAmount(Math.abs(remaining))}
                        </Text>
                      </VStack>

                      {/* Actions */}
                      <HStack gap={1}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddExpense(budget)}
                        >
                          <Plus size={14} style={{ marginRight: '4px' }} />
                          Add Expense
                        </Button>
                        <IconButton
                          aria-label="Edit budget"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(budget)}
                        >
                          <Edit size={16} />
                        </IconButton>
                        <IconButton
                          aria-label="Delete budget"
                          variant="ghost"
                          size="sm"
                          colorPalette="red"
                          onClick={() => handleDelete(budget)}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </HStack>
                    </Grid>
                  </Box>
                );
              })}
            </VStack>
          )}
        </Box>
      </VStack>
    </DashboardLayout>
  );
}

