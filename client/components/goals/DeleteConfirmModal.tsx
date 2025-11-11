'use client';

import { Box, Text, VStack, HStack } from '@chakra-ui/react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Button } from '@/components/ui/Button';
import { Goal } from '@/types';
import { useCurrency } from '@/hooks/useCurrency';
import { differenceInDays } from 'date-fns';

interface DeleteConfirmModalProps {
  goal: Goal;
  onConfirm?: () => Promise<void>;
}

export default NiceModal.create<DeleteConfirmModalProps>(({ goal, onConfirm }) => {
  const modal = useModal();
  const { symbol } = useCurrency();

  const currentAmount = typeof goal.currentAmount === 'string' ? parseFloat(goal.currentAmount) : goal.currentAmount;
  const targetAmount = typeof goal.targetAmount === 'string' ? parseFloat(goal.targetAmount) : goal.targetAmount;
  const progress = targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;
  const remaining = targetAmount - currentAmount;
  
  const daysRemaining = goal.targetDate 
    ? differenceInDays(new Date(goal.targetDate), new Date())
    : null;

  const getWarningMessage = () => {
    if (progress >= 90) {
      return `You're so close! You've saved ${progress.toFixed(0)}% of your goal. Are you sure you want to delete "${goal.title}"?`;
    } else if (progress >= 50) {
      return `You're halfway there! You've saved ${progress.toFixed(0)}% of your goal. Are you sure you want to delete "${goal.title}"?`;
    } else if (daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 30) {
      return `Only ${daysRemaining} days left! Are you sure you want to delete "${goal.title}"?`;
    } else {
      return `Are you sure you want to delete "${goal.title}"?`;
    }
  };

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    modal.hide();
  };

  const formatAmount = (amount: number) => {
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
        maxW={{ base: '100%', lg: '450px' }}
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
          Delete Goal?
        </Text>

        <VStack gap={{ base: 3, lg: 4 }} align="stretch" mb={{ base: 4, lg: 6 }}>
          <Text fontSize={{ base: 'sm', lg: 'md' }} color="text-secondary" fontWeight="medium">
            {getWarningMessage()}
          </Text>
          
          <Box bg="bg-overlay" borderRadius="8px" p={{ base: 3, lg: 4 }}>
            <VStack gap={{ base: 1.5, lg: 2 }} align="stretch">
              <Box>
                <Text fontSize={{ base: '2xs', lg: 'xs' }} color="text-muted" mb={1}>
                  Goal Title
                </Text>
                <Text fontSize={{ base: 'sm', lg: 'md' }} fontWeight="medium" color="text-primary">
                  {goal.title}
                </Text>
                {goal.description && (
                  <Text fontSize={{ base: '2xs', lg: 'xs' }} color="text-secondary" mt={1}>
                    {goal.description}
                  </Text>
                )}
              </Box>

              <HStack justify="space-between" pt={2} borderTop="1px solid" borderColor="border-color">
                <Box>
                  <Text fontSize={{ base: '2xs', lg: 'xs' }} color="text-muted" mb={1}>
                    Amount Saved
                  </Text>
                  <Text fontSize={{ base: 'sm', lg: 'md' }} fontWeight="bold" color="text-primary">
                    {formatAmount(currentAmount)}
                  </Text>
                </Box>
                <Box textAlign="right">
                  <Text fontSize={{ base: '2xs', lg: 'xs' }} color="text-muted" mb={1}>
                    Target Amount
                  </Text>
                  <Text fontSize={{ base: 'sm', lg: 'md' }} fontWeight="bold" color="text-primary">
                    {formatAmount(targetAmount)}
                  </Text>
                </Box>
              </HStack>

              <HStack justify="space-between" pt={2} borderTop="1px solid" borderColor="border-color">
                <Box>
                  <Text fontSize={{ base: '2xs', lg: 'xs' }} color="text-muted" mb={1}>
                    Progress
                  </Text>
                  <Text fontSize={{ base: 'sm', lg: 'md' }} fontWeight="bold" color="text-primary">
                    {progress.toFixed(0)}%
                  </Text>
                </Box>
                {daysRemaining !== null && (
                  <Box textAlign="right">
                    <Text fontSize={{ base: '2xs', lg: 'xs' }} color="text-muted" mb={1}>
                      Time Left
                    </Text>
                    <Text fontSize={{ base: 'sm', lg: 'md' }} fontWeight="bold" color={daysRemaining > 0 ? 'text-primary' : 'red.500'}>
                      {daysRemaining > 0 ? `${daysRemaining} days` : 'Deadline passed'}
                    </Text>
                  </Box>
                )}
              </HStack>

              {remaining > 0 && (
                <Box pt={2} borderTop="1px solid" borderColor="border-color">
                  <Text fontSize={{ base: '2xs', lg: 'xs' }} color="text-muted" mb={1}>
                    Remaining to Reach Goal
                  </Text>
                  <Text fontSize={{ base: 'sm', lg: 'md' }} fontWeight="bold" color="text-primary">
                    {formatAmount(remaining)}
                  </Text>
                </Box>
              )}
            </VStack>
          </Box>

          <Text fontSize={{ base: '2xs', lg: 'xs' }} color="text-muted">
            This action cannot be undone. All progress will be lost.
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
            Delete Goal
          </Button>
        </HStack>
      </Box>
    </Box>
  );
});

