'use client';

import { useState } from 'react';
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
import { Goal } from '@/types';

interface AddMoneyModalProps {
  goal: Goal;
  onSave?: (amount: number) => Promise<void>;
}

export default NiceModal.create<AddMoneyModalProps>(({ goal, onSave }) => {
  const modal = useModal();
  const { symbol } = useCurrency();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const currentAmount = typeof goal.currentAmount === 'string' ? parseFloat(goal.currentAmount) : goal.currentAmount;
  const targetAmount = typeof goal.targetAmount === 'string' ? parseFloat(goal.targetAmount) : goal.targetAmount;
  const remaining = targetAmount - currentAmount;

  const onClose = () => {
	setAmount('');
	modal.hide();
  }

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toaster.create({
        title: 'Invalid amount',
        description: 'Please enter a valid amount greater than 0',
        type: 'error',
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSave?.(parseFloat(amount));
      onClose()
      toaster.create({
        title: 'Money added',
        description: `Successfully added ${symbol}${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} to your goal`,
        type: 'success',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add money';
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
      onClick={onClose}
    >
      <Box
        bg="bg-card"
        borderRadius={{ base: '16px 16px 0 0', lg: '16px' }}
        p={{ base: 4, lg: 6 }}
        maxW={{ base: '100%', lg: '400px' }}
        w={{ base: '100%', lg: '90%' }}
        maxH={{ base: '85vh', lg: '90vh' }}
        overflowY="auto"
        boxShadow="shadow-lg"
        onClick={(e) => e.stopPropagation()}
        position={{ base: 'fixed', lg: 'relative' }}
        bottom={{ base: 0, lg: 'auto' }}
        left={{ base: 0, lg: 'auto' }}
        right={{ base: 0, lg: 'auto' }}
      >
        <VStack gap={{ base: 3, lg: 4 }} align="stretch">
          <Text fontSize={{ base: 'xl', lg: '2xl' }} fontWeight="bold" color="text-primary">
            Add Money to Goal
          </Text>

          <Box>
            <Text fontSize={{ base: 'sm', lg: 'md' }} fontWeight="medium" mb={1} color="text-primary">
              {goal.title}
            </Text>
            <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-muted">
              Current: {symbol}{currentAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / {symbol}{targetAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-secondary" mt={1}>
              Remaining: {symbol}{remaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </Box>

          <Box>
            <Text fontSize={{ base: 'xs', lg: 'sm' }} fontWeight="medium" mb={{ base: 1.5, lg: 2 }} color="text-primary">
              Amount to Add *
            </Text>
            <Input
              type="number"
              placeholder={`${symbol}0.00`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              autoFocus={true}
            />
          </Box>

          <HStack gap={{ base: 1.5, lg: 3 }} justify="flex-end" mt={{ base: 3, lg: 4 }}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              fontSize={{ base: 'xs', lg: 'sm' }}
              px={{ base: 3, lg: 4 }}
              py={{ base: 2, lg: 2.5 }}
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              bg="button-primary"
              color="button-text"
              size="sm"
              fontSize={{ base: 'xs', lg: 'sm' }}
              px={{ base: 3, lg: 4 }}
              py={{ base: 2, lg: 2.5 }}
              onClick={handleSubmit}
              isLoading={isLoading}
            >
              Add Money
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
});

