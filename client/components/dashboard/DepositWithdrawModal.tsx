'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  VStack,
  HStack,
  Text,
  Select,
  Box,
  createListCollection,
} from '@chakra-ui/react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCategories } from '@/hooks/useCategories';
import { useCurrency } from '@/hooks/useCurrency';
import { toaster } from '@/components/ui/toaster';
import { usePostRequest } from '@/hooks/useRequest';
import { mutate } from 'swr';

interface DepositWithdrawModalProps {
  type: 'INCOME' | 'EXPENSE';
  onSuccess?: () => void;
}

const createCategoryCollection = (categories: Array<{ id: string; name: string }>) => {
  return createListCollection({
    items: categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  });
};

export default NiceModal.create<DepositWithdrawModalProps>(({ type, onSuccess }) => {
  const modal = useModal();
  const { symbol } = useCurrency();
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const postRequest = usePostRequest();

  // Fetch categories from API
  const { categories, isLoading: categoriesLoading } = useCategories({ type });
  
  // Create collection for categories Select
  const categoryCollection = useMemo(() => {
    return createCategoryCollection(categories);
  }, [categories]);

  // Initialize form
  useEffect(() => {
    setCategoryId('');
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
  }, [modal.visible, type]);

  const handleSubmit = async () => {
    if (!categoryId) {
      toaster.create({
        title: 'Category required',
        description: 'Please select a category',
        type: 'error',
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toaster.create({
        title: 'Invalid amount',
        description: 'Please enter a valid amount greater than 0',
        type: 'error',
      });
      return;
    }

    if (!date) {
      toaster.create({
        title: 'Date required',
        description: 'Please select a date',
        type: 'error',
      });
      return;
    }

    setIsLoading(true);
    try {
      await postRequest('/api/transactions', {
        categoryId,
        amount: parseFloat(amount),
        description: description.trim() || undefined,
        date: new Date(date).toISOString(),
        type,
      });
      
      // Refresh relevant data
      mutate((key) => typeof key === 'string' && key.includes('/api/'));
      
      toaster.create({
        title: type === 'INCOME' ? 'Deposit successful' : 'Withdrawal successful',
        type: 'success',
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      modal.hide();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save transaction';
      toaster.create({
        title: 'Error',
        description: errorMessage,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!modal.visible) return null;

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="blackAlpha.600"
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      onClick={() => modal.hide()}
    >
      <Box
        bg="bg-card"
        borderRadius={{ base: '16px 16px 0 0', lg: '8px' }}
        p={{ base: 4, lg: 6 }}
        maxW={{ base: '100%', lg: '500px' }}
        w={{ base: '100%', lg: '90%' }}
        maxH={{ base: '85vh', lg: '90vh' }}
        overflowY="auto"
        boxShadow="xl"
        onClick={(e) => e.stopPropagation()}
        position={{ base: 'fixed', lg: 'relative' }}
        bottom={{ base: 0, lg: 'auto' }}
        left={{ base: 0, lg: 'auto' }}
        right={{ base: 0, lg: 'auto' }}
      >
        <Text fontSize={{ base: 'xl', lg: '2xl' }} fontWeight="bold" color="text-primary" mb={{ base: 3, lg: 4 }}>
          {type === 'INCOME' ? 'Deposit' : 'Withdraw'}
        </Text>

        <VStack gap={{ base: 3, lg: 4 }} align="stretch">
          <Box>
            <Text fontSize={{ base: 'xs', lg: 'sm' }} fontWeight="medium" mb={{ base: 1.5, lg: 2 }} color="text-primary">
              Category *
            </Text>
            {categoriesLoading ? (
              <Select.Root disabled collection={createListCollection({ items: [] })}>
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="Loading categories..." />
                  </Select.Trigger>
                </Select.Control>
              </Select.Root>
            ) : categoryCollection.items.length === 0 ? (
              <Box>
                <Select.Root disabled collection={createListCollection({ items: [] })}>
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="No categories available" />
                    </Select.Trigger>
                  </Select.Control>
                </Select.Root>
                <Text fontSize="xs" color="text-muted" mt={2}>
                  No categories found. Please seed the database with categories.
                </Text>
              </Box>
            ) : (
              <Select.Root
                collection={categoryCollection}
                value={categoryId ? [categoryId] : []}
                onValueChange={(details) => {
                  const newCategoryId = details.value[0];
                  if (newCategoryId) setCategoryId(newCategoryId);
                }}
              >
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="Select a category" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Select.Positioner>
                  <Select.Content>
                    {categoryCollection.items.map((item) => (
                      <Select.Item item={item} key={item.value}>
                        {item.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Select.Root>
            )}
          </Box>

          <Input
            label="Amount *"
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            leftElement={<Text fontSize="sm">{symbol}</Text>}
            placeholder="0.00"
          />

          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a note (optional)"
          />

          <Input
            label="Date *"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </VStack>

        <HStack gap={{ base: 1.5, lg: 2 }} mt={{ base: 4, lg: 6 }} justify="flex-end">
          <Button 
            variant="outline"
            size="sm"
            fontSize={{ base: 'xs', lg: 'sm' }}
            px={{ base: 3, lg: 4 }}
            py={{ base: 2, lg: 2.5 }}
            onClick={() => modal.hide()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            bg="button-primary"
            color="button-text"
            borderRadius="18px"
            size="sm"
            fontSize={{ base: 'xs', lg: 'sm' }}
            px={{ base: 3, lg: 4 }}
            py={{ base: 2, lg: 2.5 }}
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText={type === 'INCOME' ? 'Depositing...' : 'Withdrawing...'}
          >
            {type === 'INCOME' ? 'Deposit' : 'Withdraw'}
          </Button>
        </HStack>
      </Box>
    </Box>
  );
});

