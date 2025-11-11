'use client';

import { Box, Text, VStack, HStack } from '@chakra-ui/react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Button } from '@/components/ui/Button';
import { Budget } from '@/types';
import { useCurrency } from '@/hooks/useCurrency';

interface DeleteConfirmModalProps {
  budget: Budget;
  onConfirm?: () => Promise<void>;
}

export default NiceModal.create<DeleteConfirmModalProps>(({ budget, onConfirm }) => {
  const modal = useModal();
  const { symbol } = useCurrency();

  const formatAmount = (value: number) => {
    return `${symbol}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    modal.hide();
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
          Delete Budget?
        </Text>

        <VStack gap={{ base: 2.5, lg: 3 }} align="stretch" mb={{ base: 4, lg: 6 }}>
          <Text fontSize={{ base: 'sm', lg: 'md' }} color="text-secondary">
            Are you sure you want to delete the budget for:
          </Text>
          <Box bg="bg-overlay" borderRadius="8px" p={{ base: 2.5, lg: 3 }}>
            <Text fontSize={{ base: 'sm', lg: 'md' }} fontWeight="medium" color="text-primary">
              {budget.category?.name || 'Uncategorized'}
            </Text>
            <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-muted">
              Amount: {formatAmount(budget.amount)}
            </Text>
          </Box>
          <Text fontSize={{ base: '2xs', lg: 'xs' }} color="text-muted">
            This action cannot be undone.
          </Text>
        </VStack>

        <HStack gap={{ base: 1.5, lg: 2 }} justify="flex-end">
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
            bg="red.500"
            color="white"
            borderRadius="18px"
            size="sm"
            fontSize={{ base: 'xs', lg: 'sm' }}
            px={{ base: 3, lg: 4 }}
            py={{ base: 2, lg: 2.5 }}
            onClick={handleConfirm}
            _hover={{ bg: 'red.600' }}
          >
            Delete
          </Button>
        </HStack>
      </Box>
    </Box>
  );
});

