'use client';

import { Box, Text, HStack, VStack, IconButton, Avatar, Input as ChakraInput, Select, createListCollection, Skeleton } from '@chakra-ui/react';
import { Search, X } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { format } from 'date-fns';
import { Transaction } from '@/types';
import { useTransactions } from '@/hooks/useTransactions';
import { useState, useMemo } from 'react';

export function RecentTransactions() {
  const { symbol } = useCurrency();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'INCOME' | 'EXPENSE' | ''>('');

  const { transactions, isLoading } = useTransactions({
    limit: 4,
    sortBy: 'date',
    sortOrder: 'desc',
    type: typeFilter || undefined,
  });

  const formatAmount = (amount: number, type: string) => {
    const sign = type === 'EXPENSE' ? '-' : '+';
    return `${sign}${symbol}${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy \'at\' h:mm a');
    } catch {
      return dateString;
    }
  };

  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;
    const query = searchQuery.toLowerCase().trim();
    
    const numericValue = parseFloat(query);
    const isNumeric = !isNaN(numericValue) && isFinite(numericValue);
    
    return transactions.filter(
      (t: Transaction) => {
        const matchesText = 
          (t.description || '').toLowerCase().includes(query) ||
          (t.category?.name || '').toLowerCase().includes(query);
        
        const transactionAmount = Number(t.amount);
        const matchesAmount = isNumeric && 
          (Math.abs(transactionAmount - numericValue) < 0.01 ||
           Math.abs(transactionAmount - (-numericValue)) < 0.01 ||
           Math.abs(Math.abs(transactionAmount) - Math.abs(numericValue)) < 0.01);
        
        return matchesText || matchesAmount;
      }
    );
  }, [transactions, searchQuery]);

  const typeFilterCollection = createListCollection({
    items: [
      { value: '', label: 'All Types' },
      { value: 'INCOME', label: 'Income' },
      { value: 'EXPENSE', label: 'Expense' },
    ],
  });

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
          Recent Transactions
        </Box>
        <HStack gap={2}>
          <HStack gap={1} alignItems="center" display={{base: "none", lg: "flex"}}>
            {searchOpen ? (
              <Box
                display="flex"
                alignItems="center"
                gap={2}
                bg="bg-overlay"
                borderRadius="8px"
                px={2}
                py={1}
                minW="200px"
                css={{
                  animation: 'slideIn 0.3s ease',
                }}
              >
                <ChakraInput
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="sm"
                  autoFocus
                  border="none"
                  _focus={{ boxShadow: 'none' }}
                  bg="transparent"
                />
                <IconButton
                  aria-label="Close search"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                >
                  <X size={16} />
                </IconButton>
              </Box>
            ) : (
              <IconButton
                aria-label="Search"
                variant="ghost"
                size="sm"
                onClick={() => setSearchOpen(true)}
              >
                <Search size={18} />
              </IconButton>
            )}
          </HStack>
          <Select.Root
            collection={typeFilterCollection}
            value={typeFilter ? [typeFilter] : []}
            onValueChange={(details) => {
              const newType = details.value[0] as 'INCOME' | 'EXPENSE' | '';
              setTypeFilter(newType || '');
            }}
            size="sm"
            width="120px"
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Filter" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Select.Positioner>
              <Select.Content>
                {typeFilterCollection.items.map((item) => (
                  <Select.Item item={item} key={item.value}>
                    {item.label}
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
        </HStack>
      </HStack>

      <Box overflowX="auto">
        <Box as="table" width="100%">
          <Box as="thead">
            <Box as="tr" borderBottom="1px solid" borderColor="border-table">
              <Box as="th" fontSize="xs" color="text-muted" fontWeight="normal" textAlign="left" pb={3} pr={4}>
                Transactions
              </Box>
              <Box as="th" fontSize="xs" color="text-muted" fontWeight="normal" textAlign="left" pb={3} pr={4}>
                Category
              </Box>
              <Box as="th" fontSize="xs" color="text-muted" fontWeight="normal" textAlign="right" pb={3}>
                Amount
              </Box>
            </Box>
          </Box>
          <Box as="tbody">
            {isLoading ? (
              <>
                {[1, 2].map((i) => (
                  <Box as="tr" key={i} borderBottom="1px solid" borderColor="border-table-row">
                    <Box as="td" py={4} pr={4}>
                      <HStack gap={3}>
                        <Skeleton boxSize="40px" borderRadius="full" />
                        <VStack align="start" gap={1}>
                          <Skeleton height="16px" width="120px" />
                          <Skeleton height="12px" width="80px" />
                        </VStack>
                      </HStack>
                    </Box>
                    <Box as="td" py={4} pr={4}>
                      <Skeleton height="16px" width="100px" />
                    </Box>
                    <Box as="td" py={4} textAlign="right">
                      <Skeleton height="16px" width="80px" ml="auto" />
                    </Box>
                  </Box>
                ))}
              </>
            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: '32px 0', textAlign: 'center' }}>
                  <Box as="span" color="text-muted">
                    {searchQuery || typeFilter ? 'No transactions match your filters' : 'No transactions yet'}
                  </Box>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((transaction: Transaction) => (
                <Box as="tr" key={transaction.id} borderBottom="1px solid" borderColor="border-table-row">
                  <Box as="td" py={4} pr={4}>
                    <HStack gap={3}>
                      <Avatar.Root size="md">
                        <Avatar.Fallback name={transaction.description || transaction.category?.name || 'Transaction'} />
                      </Avatar.Root>
                      <VStack align="start" gap={0}>
                        <Text fontSize="sm" fontWeight="medium" color="text-primary">
                          {transaction.description || 'Transaction'}
                        </Text>
                        <Text fontSize="xs" color="text-muted">
                          {formatDate(transaction.date)}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                  <Box as="td" py={4} pr={4}>
                    <Text fontSize="sm" color="text-secondary">
                      • {transaction.category?.name || 'Uncategorized'}
                    </Text>
                  </Box>
                  <Box as="td" py={4} textAlign="right">
                    <Text fontSize="sm" fontWeight="semibold" color="text-primary">
                      {formatAmount(Number(transaction.amount), transaction.type)}
                    </Text>
                  </Box>
                </Box>
              ))
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
