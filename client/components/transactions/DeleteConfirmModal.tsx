'use client';

import { useState } from 'react';
import {
  VStack,
  HStack,
  Text,
  Box,
} from '@chakra-ui/react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Button } from '@/components/ui/Button';
import { useCurrency } from '@/hooks/useCurrency';
import { toaster } from '@/components/ui/toaster';
import { Transaction } from '@/types';

interface DeleteConfirmModalProps {
  transaction: Transaction;
  onConfirm?: () => Promise<void>;
}

export default NiceModal.create<DeleteConfirmModalProps>(({ transaction, onConfirm }) => {
  const modal = useModal();
  const { symbol } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      if (onConfirm) {
        await onConfirm();
      }
      toaster.create({
        title: 'Transaction deleted',
        type: 'success',
      });
      modal.hide();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete transaction';
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

  const formatAmount = (amount: number, type: string) => {
    const sign = type === 'EXPENSE' ? '-' : '+';
    return `${sign}${symbol}${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

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
        maxW={{ base: '100%', lg: '400px' }}
        w={{ base: '100%', lg: '90%' }}
        boxShadow="xl"
        onClick={(e) => e.stopPropagation()}
        position={{ base: 'fixed', lg: 'relative' }}
        bottom={{ base: 0, lg: 'auto' }}
        left={{ base: 0, lg: 'auto' }}
        right={{ base: 0, lg: 'auto' }}
      >
        <Text fontSize={{ base: 'xl', lg: '2xl' }} fontWeight="bold" color="text-primary" mb={{ base: 3, lg: 4 }}>
          Delete Transaction
        </Text>

        <VStack gap={{ base: 3, lg: 4 }} align="stretch">
          <Text fontSize={{ base: 'sm', lg: 'md' }} color="text-secondary">
            Are you sure you want to delete this transaction? This action cannot be undone.
          </Text>
          <Box bg="bg-secondary" borderRadius="8px" p={{ base: 3, lg: 4 }}>
            <VStack align="stretch" gap={{ base: 1.5, lg: 2 }}>
              <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-muted">
                Description
              </Text>
              <Text fontSize={{ base: 'sm', lg: 'md' }} fontWeight="medium" color="text-primary">
                {transaction.description || 'Transaction'}
              </Text>
              <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-muted">
                Category
              </Text>
              <Text fontSize={{ base: 'sm', lg: 'md' }} color="text-secondary">
                {transaction.category?.name || 'Uncategorized'}
              </Text>
              <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-muted">
                Amount
              </Text>
              <Text
                fontSize={{ base: 'md', lg: 'lg' }}
                fontWeight="semibold"
                color={transaction.type === 'INCOME' ? 'success' : 'text-primary'}
              >
                {formatAmount(typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount, transaction.type)}
              </Text>
            </VStack>
          </Box>
        </VStack>

        <HStack gap={{ base: 1.5, lg: 2 }} mt={{ base: 4, lg: 6 }} justify="flex-end">
          <Button 
            variant="outline" 
            size="sm"
            fontSize={{ base: 'xs', lg: 'sm' }}
            px={{ base: 3, lg: 4 }}
            py={{ base: 2, lg: 2.5 }}
            onClick={() => modal.hide()}
          >
            Cancel
          </Button>
          <Button
            bg="error"
            color="white"
            borderRadius="18px"
            size="sm"
            fontSize={{ base: 'xs', lg: 'sm' }}
            px={{ base: 3, lg: 4 }}
            py={{ base: 2, lg: 2.5 }}
            onClick={handleConfirm}
            isLoading={isLoading}
          >
            Delete
          </Button>
        </HStack>
      </Box>
    </Box>
  );
});
