'use client';

import { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Text,
  Box,
} from '@chakra-ui/react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCurrency } from '@/hooks/useCurrency';
import { toaster } from '@/components/ui/toaster';
import { Budget } from '@/types';

interface AddExpenseModalProps {
  budget: Budget;
  onSave?: (data: {
    categoryId: string;
    amount: number;
    description?: string;
    date: string;
    type: 'EXPENSE';
  }) => Promise<void>;
}

export default NiceModal.create<AddExpenseModalProps>(({ budget, onSave }) => {
  const modal = useModal();
  const { symbol } = useCurrency();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
  }, [modal.visible]);

  const handleSubmit = async () => {
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
      if (onSave) {
        await onSave({
          categoryId: budget.categoryId,
          amount: parseFloat(amount),
          description: description.trim() || undefined,
          date: new Date(date).toISOString(),
          type: 'EXPENSE',
        });
      }
      
      toaster.create({
        title: 'Expense recorded',
        description: `Added expense to ${budget.category?.name} budget`,
        type: 'success',
      });
      
      modal.hide();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to record expense';
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
        <VStack align="start" gap={{ base: 1.5, lg: 2 }} mb={{ base: 3, lg: 4 }}>
          <Text fontSize={{ base: 'xl', lg: '2xl' }} fontWeight="bold" color="text-primary">
            Add Expense
          </Text>
          <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-muted">
            Category: {budget.category?.name || 'Uncategorized'}
          </Text>
        </VStack>

        <VStack gap={{ base: 3, lg: 4 }} align="stretch">
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
            loadingText="Adding..."
          >
            Add Expense
          </Button>
        </HStack>
      </Box>
    </Box>
  );
});

