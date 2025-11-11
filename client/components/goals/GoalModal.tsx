'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  VStack,
  HStack,
  Text,
  Box,
  SimpleGrid,
} from '@chakra-ui/react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCurrency } from '@/hooks/useCurrency';
import { useColorMode } from '@/components/ui/color-mode';
import { toaster } from '@/components/ui/toaster';
import { Goal } from '@/types';
import { CreateGoalData } from '@/types/goals';
import { addMonths, format } from 'date-fns';

interface GoalModalProps {
  goal?: Goal | null;
  onSave?: (data: {
    title: string;
    description?: string;
    targetAmount: number;
    targetDate?: string;
  }, goalId?: string) => Promise<void>;
}

export default NiceModal.create<GoalModalProps>(({ goal = null, onSave }) => {
  const modal = useModal();
  const { symbol } = useCurrency();
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateGoalData>({
    defaultValues: {
      title: '',
      description: '',
      targetAmount: 0,
      targetDate: undefined,
    },
  });

  const selectedDate = watch('targetDate');

  const handleQuickSelect = (months: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const targetDate = addMonths(new Date(), months);
    const dateString = format(targetDate, 'yyyy-MM-dd');
    setValue('targetDate', dateString, { shouldValidate: false, shouldDirty: true });
  };

  const quickSelectOptions = [
    { 
      label: '3 mos', 
      months: 3, 
      color: isDarkMode ? '#4A1F1F' : '#FFE5E5',
      colorLight: '#FFE5E5',
      colorDark: '#4A1F1F',
    },
    { 
      label: '6 mos', 
      months: 6, 
      color: isDarkMode ? '#1F2F4A' : '#E5F3FF',
      colorLight: '#E5F3FF',
      colorDark: '#1F2F4A',
    },
    { 
      label: '12 mos', 
      months: 12, 
      color: isDarkMode ? '#1F4A1F' : '#E5FFE5',
      colorLight: '#E5FFE5',
      colorDark: '#1F4A1F',
    },
    { 
      label: '18 mos', 
      months: 18, 
      color: isDarkMode ? '#4A3F1F' : '#FFF5E5',
      colorLight: '#FFF5E5',
      colorDark: '#4A3F1F',
    },
  ];

  useEffect(() => {
    if (goal) {
      reset({
        title: goal.title || '',
        description: goal.description || '',
        targetAmount: typeof goal.targetAmount === 'string' ? parseFloat(goal.targetAmount) : goal.targetAmount,
        targetDate: goal.targetDate ? format(new Date(goal.targetDate), 'yyyy-MM-dd') : undefined,
      });
    } else {
      reset({
        title: '',
        description: '',
        targetAmount: 0,
        targetDate: undefined,
      });
    }
  }, [goal, modal.visible, reset]);

  const onSubmit = async (data: CreateGoalData) => {
    try {
      const targetDateISO = data.targetDate ? new Date(data.targetDate).toISOString() : undefined;
      
      await onSave?.(
        {
          title: data.title.trim(),
          description: data.description?.trim() || undefined,
          targetAmount: data.targetAmount,
          targetDate: targetDateISO,
        },
        goal?.id
      );

      modal.hide();
      toaster.create({
        title: goal ? 'Goal updated' : 'Goal created',
        description: goal ? 'Your goal has been updated successfully' : 'Your goal has been created successfully',
        type: 'success',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save goal';
      toaster.create({
        title: 'Error',
        description: errorMessage,
        type: 'error',
      });
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
        borderRadius={{ base: '16px 16px 0 0', lg: '16px' }}
        p={{ base: 4, lg: 6 }}
        maxW={{ base: '100%', lg: '500px' }}
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack gap={{ base: 3, lg: 4 }} align="stretch">
          <Text fontSize={{ base: 'xl', lg: '2xl' }} fontWeight="bold" color="text-primary">
            {goal ? 'Edit Goal' : 'Create New Goal'}
          </Text>

          <VStack gap={{ base: 2.5, lg: 3 }} align="stretch">
            <Box>
              <Text fontSize={{ base: 'xs', lg: 'sm' }} fontWeight="medium" mb={{ base: 1.5, lg: 2 }} color="text-primary">
                Goal Title *
              </Text>
              <Input
                placeholder="e.g., Travel, Emergency Fund"
                {...register('title', {
                  required: 'Title is required',
                  minLength: {
                    value: 1,
                    message: 'Title cannot be empty',
                  },
                })}
              />
              {errors.title && (
                <Text fontSize="xs" color="red.500" mt={1}>
                  {errors.title.message}
                </Text>
              )}
            </Box>

            <Box>
              <Text fontSize={{ base: 'xs', lg: 'sm' }} fontWeight="medium" mb={{ base: 1.5, lg: 2 }} color="text-primary">
                Description
              </Text>
              <Input
                placeholder="Optional description"
                {...register('description')}
              />
            </Box>

            <Box>
              <Text fontSize={{ base: 'xs', lg: 'sm' }} fontWeight="medium" mb={{ base: 1.5, lg: 2 }} color="text-primary">
                Target Amount *
              </Text>
              <Input
                type="number"
                placeholder={`${symbol}0.00`}
                {...register('targetAmount', {
                  required: 'Target amount is required',
                  min: {
                    value: 0.01,
                    message: 'Target amount must be greater than 0',
                  },
                  valueAsNumber: true,
                })}
                step="0.01"
              />
              {errors.targetAmount && (
                <Text fontSize="xs" color="red.500" mt={1}>
                  {errors.targetAmount.message}
                </Text>
              )}
            </Box>

            <Box>
              <Text fontSize={{ base: 'xs', lg: 'sm' }} fontWeight="medium" mb={{ base: 1.5, lg: 2 }} color="text-primary">
                Target Date (Span)
              </Text>
              
              {/* Quick select boxes */}
              <SimpleGrid columns={4} gap={{ base: 1.5, lg: 2 }} mb={3}>
                {quickSelectOptions.map((option) => {
                  const targetDate = addMonths(new Date(), option.months);
                  const dateString = format(targetDate, 'yyyy-MM-dd');
                  const isSelected = selectedDate === dateString;

                  return (
                    <Box
                      key={option.months}
                      as="button"
                      bg={option.color}
                      border={isSelected ? (isDarkMode ? '1px solid white' : '1px solid black') : `1px solid ${option.color}`}
                      borderRadius="8px"
                      p={2}
                      fontSize="xs"
                      fontWeight="medium"
                      color={isDarkMode ? (isSelected ? 'white' : 'text-primary') : (isSelected ? 'text-primary' : 'text-secondary')}
                      transition="all 0.2s"
                      onClick={(e) => handleQuickSelect(option.months, e)}
                    >
                      {option.label}
                    </Box>
                  );
                })}
              </SimpleGrid>

              <Input
                type="date"
                {...register('targetDate')}
                min={new Date().toISOString().split('T')[0]}
              />
              <Text fontSize="xs" color="text-muted" mt={1}>
                Optional: Set a deadline for your goal
              </Text>
            </Box>
          </VStack>

          <HStack gap={{ base: 1.5, lg: 3 }} justify="flex-end" mt={{ base: 3, lg: 4 }}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              fontSize={{ base: 'xs', lg: 'sm' }}
              px={{ base: 3, lg: 4 }}
              py={{ base: 2, lg: 2.5 }}
              onClick={() => modal.hide()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              bg="button-primary"
              color="button-text"
              size="sm"
              fontSize={{ base: 'xs', lg: 'sm' }}
              px={{ base: 3, lg: 4 }}
              py={{ base: 2, lg: 2.5 }}
              isLoading={isSubmitting}
            >
              {goal ? 'Update Goal' : 'Create Goal'}
            </Button>
          </HStack>
        </VStack>
      </form>
      </Box>
    </Box>
  );
});

