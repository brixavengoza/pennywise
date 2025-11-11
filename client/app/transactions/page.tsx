'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Box, Heading, Text, VStack, HStack, Grid, IconButton, Select, Input as ChakraInput, createListCollection, Stack, Skeleton, Flex } from '@chakra-ui/react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { usePostRequest, usePutRequest, useDeleteRequest } from '@/hooks/useRequest';
import { useCurrency } from '@/hooks/useCurrency';
import { format } from 'date-fns';
import NiceModal from '@ebay/nice-modal-react';
import TransactionModal from '@/components/transactions/TransactionModal';
import DeleteConfirmModal from '@/components/transactions/DeleteConfirmModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Transaction } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';

export default function TransactionsPage() {
  const { symbol } = useCurrency();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'INCOME' | 'EXPENSE' | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const debounceSearchQuery = useDebounce(searchQuery, 300);

  const formattedStartDate = startDate ? new Date(startDate).toISOString() : undefined;
  const formattedEndDate = endDate ? new Date(endDate).toISOString() : undefined;

  const { transactions, pagination, isLoading, mutate } = useTransactions({
    page,
    limit: 20,
    type: typeFilter || undefined,
    startDate: formattedStartDate,
    endDate: formattedEndDate,
    search: debounceSearchQuery || undefined,
  });

  const postRequest = usePostRequest();
  const putRequest = usePutRequest();
  const deleteRequest = useDeleteRequest();

  // Transform amount from string to number if needed
  const filteredTransactions = useMemo(() => {
    return transactions.map((t: Transaction) => ({
      ...t,
      amount: typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount,
    }));
  }, [transactions]);

  const formatAmount = (amount: number, type: string) => {
    const sign = type === 'EXPENSE' ? '-' : '+';
    return `${sign}${symbol}${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const handleCreate = () => {
    NiceModal.show(TransactionModal, {
      transaction: null,
      onSave: handleSave,
    });
  };

  const handleEdit = (transaction: Transaction) => {
    NiceModal.show(TransactionModal, {
      transaction,
      onSave: handleSave,
    });
  };

  const handleDelete = (transaction: Transaction) => {
    NiceModal.show(DeleteConfirmModal, {
      transaction,
      onConfirm: async () => {
        await handleDeleteConfirm(transaction);
      },
    });
  };

  const handleSave = async (
    data: {
      categoryId: string;
      amount: number;
      description?: string;
      date: string;
      type: 'INCOME' | 'EXPENSE';
    },
    transaction?: Transaction | null
  ) => {
    try {
      if (transaction) {
        // Update
        await putRequest(`/api/transactions/${transaction.id}`, data);
      } else {
        // Create - reset to page 1 to show new transaction
        await postRequest('/api/transactions', data);
        setPage(1);
      }
      // Force refresh by mutating
      await mutate();
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw error;
    }
  };

  const handleDeleteConfirm = async (transaction: Transaction) => {
    try {
      await deleteRequest(`/api/transactions/${transaction.id}`);
      mutate();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const hasActiveFilters = searchQuery || typeFilter || startDate || endDate;

  return (
    <DashboardLayout>
      <VStack align="stretch" gap={{base: "30px", lg: "50px"}}>
        {/* Header */}
        <Flex flexDirection={{ base: 'column', md: 'row' }} justify="space-between" gap={{ base: 3, lg: 5 }} align={{ base: 'stretch', md: 'center' }}> 
          <Box textAlign={{ base: 'center', lg: 'left' }}>
            <Heading size={{ base: '2xl', lg: '4xl' }} color="text-primary" fontWeight="bold">
              Transactions
            </Heading>
            <Text fontSize={{ base: 'lg', lg: '3xl' }} color="text-secondary" mt={{ base: 1, lg: 0 }}>
              Manage your income and expenses
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
              <Text fontSize={{ base: 'xs', lg: 'sm' }}>Add Transaction</Text>
            </HStack>
          </Button>
        </Flex>

        {/* Filters and Actions */}
        <Stack gap={{ base: 3, lg: 5 }}>
          <Box bg="bg-card" borderRadius="8px" p={{ base: 3, lg: 4 }} boxShadow="shadow-card" position="relative">
            {hasActiveFilters && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearFilters}
                position="absolute"
                top={{ base: -8, lg: -10 }}
                right={0}
                fontSize={{ base: '2xs', lg: 'xs' }}
                px={{ base: 2, lg: 3 }}
                py={{ base: 1, lg: 1.5 }}
              >
                Clear Filters
              </Button>
            )}
            <Grid templateColumns={{ base: '1fr', lg: 'repeat(4, 1fr)' }} gap={{ base: 3, lg: 4 }}>
              <Box>
                <Input
                  placeholder="Search by description, category, amount, or date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftElement={<Search size={18} />}
                />
              </Box>
              <Box>
                <Select.Root
                  collection={createListCollection({
                    items: [
                      { value: '', label: 'All Types' },
                      { value: 'INCOME', label: 'Income' },
                      { value: 'EXPENSE', label: 'Expense' },
                    ],
                  })}
                  value={typeFilter ? [typeFilter] : []}
                  onValueChange={(details) => {
                    const newType = details.value[0] as 'INCOME' | 'EXPENSE' | '';
                    setTypeFilter(newType || '');
                  }}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger borderRadius='4px'>
                      <Select.ValueText placeholder="All Types" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Select.Positioner>
                    <Select.Content>
                      {createListCollection({
                        items: [
                          { value: '', label: 'All Types' },
                          { value: 'INCOME', label: 'Income' },
                          { value: 'EXPENSE', label: 'Expense' },
                        ],
                      }).items.map((item) => (
                        <Select.Item item={item} key={item.value}>
                          {item.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Select.Root>
              </Box>
              <Box>
                <ChakraInput
                  type="date"
                  placeholder="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Box>
              <Box>
                <ChakraInput
                  type="date"
                  placeholder="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Box>
            </Grid>
          </Box>

          {/* Transactions Table */}
          <Box bg="bg-card" borderRadius="8px" p={{ base: 3, lg: 6 }} boxShadow="shadow-card">
            {isLoading ? (
              <Box textAlign="center" py={12}>
                <Text color="text-muted">Loading transactions...</Text>
              </Box>
            ) : filteredTransactions.length === 0 ? (
              <Box textAlign="center" py={12}>
                <Text color="text-muted" fontSize="lg" mb={4}>
                  {hasActiveFilters ? 'No transactions match your filters' : 'No transactions yet'}
                </Text>
                {!hasActiveFilters && (
                  <Button
                    bg="button-primary"
                    color="button-text"
                    borderRadius="18px"
                    onClick={handleCreate}
                  >
                    <HStack gap={2}>
                      <Plus size={18} />
                      <Text>Add Your First Transaction</Text>
                    </HStack>
                  </Button>
                )}
              </Box>
            ) : (
              <>
                <Box overflowX="auto">
                  {/* Desktop Table */}
                  <Box as="table" width="100%" display={{ base: 'none', lg: 'table' }}>
                    <Box as="thead">
                      <Box as="tr" borderBottom="1px solid" borderColor="border-table">
                        <Box as="th" fontSize="xs" color="text-muted" fontWeight="normal" textAlign="left" pb={3} pr={4}>
                          Transaction
                        </Box>
                        <Box as="th" fontSize="xs" color="text-muted" fontWeight="normal" textAlign="left" pb={3} pr={4}>
                          Category
                        </Box>
                        <Box as="th" fontSize="xs" color="text-muted" fontWeight="normal" textAlign="left" pb={3} pr={4}>
                          Date
                        </Box>
                        <Box as="th" fontSize="xs" color="text-muted" fontWeight="normal" textAlign="right" pb={3} pr={4}>
                          Amount
                        </Box>
                        <Box as="th" fontSize="xs" color="text-muted" fontWeight="normal" textAlign="right" pb={3}>
                          Actions
                        </Box>
                      </Box>
                    </Box>
                    <Box as="tbody">
                      {isLoading ? (
                        <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Box as="tr" key={i} borderBottom="1px solid" borderColor="border-table-row">
                        <Box as="td" py={4} pr={4}>
                          <Skeleton height="16px" width="150px" />
                        </Box>
                        <Box as="td" py={4} pr={4}>
                          <Skeleton height="16px" width="100px" />
                        </Box>
                        <Box as="td" py={4} pr={4}>
                          <Skeleton height="16px" width="100px" />
                        </Box>
                        <Box as="td" py={4} pr={4} textAlign="right">
                          <Skeleton height="16px" width="80px" ml="auto" />
                        </Box>
                        <Box as="td" py={4} textAlign="right">
                          <HStack gap={2} justify="flex-end">
                            <Skeleton boxSize="32px" borderRadius="4px" />
                            <Skeleton boxSize="32px" borderRadius="4px" />
                          </HStack>
                        </Box>
                      </Box>
                    ))}
                  </>
                      ) : (
                        <>
                        
                      {filteredTransactions.map((transaction: Transaction) => (
                        <Box
                          as="tr"
                          key={transaction.id}
                          borderBottom="1px solid"
                          borderColor="border-table-row"
                          _hover={{ bg: 'bg-hover' }}
                        >
                          <Box as="td" py={4} pr={4}>
                            <Text fontSize="sm" fontWeight="medium" color="text-primary">
                              {transaction.description || 'Transaction'}
                            </Text>
                          </Box>
                          <Box as="td" py={4} pr={4}>
                            <Text fontSize="sm" color="text-secondary">
                              • {transaction.category?.name || 'Uncategorized'}
                            </Text>
                          </Box>
                          <Box as="td" py={4} pr={4}>
                            <Text fontSize="sm" color="text-secondary">
                              {formatDate(transaction.date)}
                            </Text>
                          </Box>
                          <Box as="td" py={4} pr={4} textAlign="right">
                            <Text
                              fontSize="sm"
                              fontWeight="semibold"
                              color={transaction.type === 'INCOME' ? 'success' : 'text-primary'}
                            >
                              {formatAmount(Number(transaction.amount), transaction.type)}
                            </Text>
                          </Box>
                          <Box as="td" py={4} textAlign="right">
                            <HStack gap={2} justify="flex-end">
                              <IconButton
                                aria-label="Edit"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(transaction)}
                              >
                                <Edit size={16} />
                              </IconButton>
                              <IconButton
                                aria-label="Delete"
                                variant="ghost"
                                size="sm"
                                colorPalette="red"
                                onClick={() => handleDelete(transaction)}
                              >
                                <Trash2 size={16} />
                              </IconButton>
                            </HStack>
                          </Box>
                        </Box>
                      ))}
                      </>
                      )}
                    </Box>
                  </Box>

                  {/* Mobile Card Layout */}
                  <VStack gap={3} align="stretch" display={{ base: 'flex', lg: 'none' }}>
                    {filteredTransactions.map((transaction: Transaction) => (
                      <Box
                        key={transaction.id}
                        bg="bg-secondary"
                        borderRadius="8px"
                        p={3}
                        border="1px solid"
                        borderColor="border-table-row"
                      >
                        <HStack justify="space-between" align="start" mb={2}>
                          <VStack align="start" gap={0.5} flex={1}>
                            <Text fontSize="sm" fontWeight="medium" color="text-primary" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                              {transaction.description || 'Transaction'}
                            </Text>
                            <Text fontSize="xs" color="text-muted">
                              • {transaction.category?.name || 'Uncategorized'} • {formatDate(transaction.date)}
                            </Text>
                          </VStack>
                          <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color={transaction.type === 'INCOME' ? 'success' : 'text-primary'}
                          >
                            {formatAmount(Number(transaction.amount), transaction.type)}
                          </Text>
                        </HStack>
                        <HStack gap={2} justify="flex-end" mt={2}>
                          <IconButton
                            aria-label="Edit"
                            variant="ghost"
                            size="xs"
                            onClick={() => handleEdit(transaction)}
                          >
                            <Edit size={14} />
                          </IconButton>
                          <IconButton
                            aria-label="Delete"
                            variant="ghost"
                            size="xs"
                            colorPalette="red"
                            onClick={() => handleDelete(transaction)}
                          >
                            <Trash2 size={14} />
                          </IconButton>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </Box>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <VStack gap={3} align="stretch" mt={{ base: 4, lg: 6 }} pt={4} borderTop="1px solid" borderColor="border-table">
                    <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-muted" textAlign={{ base: 'center', lg: 'left' }}>
                      Showing {((page - 1) * (pagination.limit || 20)) + 1} - {Math.min(page * (pagination.limit || 20), pagination.total)} of {pagination.total}
                    </Text>
                    <HStack gap={2} justify={{ base: 'center', lg: 'flex-end' }}>
                      <Button
                        size="sm"
                        variant="outline"
                        fontSize={{ base: '2xs', lg: 'xs' }}
                        px={{ base: 2, lg: 3 }}
                        py={{ base: 1.5, lg: 2 }}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-secondary" px={2}>
                        Page {page} of {pagination.totalPages}
                      </Text>
                      <Button
                        size="sm"
                        variant="outline"
                        fontSize={{ base: '2xs', lg: 'xs' }}
                        px={{ base: 2, lg: 3 }}
                        py={{ base: 1.5, lg: 2 }}
                        onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages}
                      >
                        Next
                      </Button>
                    </HStack>
                  </VStack>
                )}
              </>
            )}
          </Box>
        </Stack>
      </VStack>
    </DashboardLayout>
  );
}

