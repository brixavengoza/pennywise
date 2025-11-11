'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Box, Heading, Text, VStack, HStack, Grid, IconButton, Skeleton, Menu, Portal } from '@chakra-ui/react';
import { Plus, Edit, Trash2, Target, MoreVertical, DollarSign } from 'lucide-react';
import { useGoals, createGoal, updateGoal, deleteGoal } from '@/hooks/useGoals';
import { useCurrency } from '@/hooks/useCurrency';
import { useColorMode } from '@/components/ui/color-mode';
import { Button } from '@/components/ui/Button';
import { Goal } from '@/types';
import NiceModal from '@ebay/nice-modal-react';
import GoalModal from '@/components/goals/GoalModal';
import DeleteConfirmModal from '@/components/goals/DeleteConfirmModal';
import AddMoneyModal from '@/components/goals/AddMoneyModal';
import GoalActionSheet from '@/components/goals/GoalActionSheet';
import { toaster } from '@/components/ui/toaster';
import { generateRandomColor, generateRandomColorDark } from '@/utils/colors';

export default function GoalsPage() {
  const { symbol } = useCurrency();
  const { goals, isLoading, mutate } = useGoals();
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';


  const handleCreate = () => {
    NiceModal.show(GoalModal, {
      goal: null,
      onSave: handleSave,
    });
  };

  const handleEdit = (goal: Goal) => {
    NiceModal.show(GoalModal, {
      goal,
      onSave: handleSave,
    });
  };

  const handleAddMoney = (goal: Goal) => {
    NiceModal.show(AddMoneyModal, {
      goal,
      onSave: async (amount: number) => {
        try {
          const currentAmount = typeof goal.currentAmount === 'string' ? parseFloat(goal.currentAmount) : goal.currentAmount;
          const newAmount = currentAmount + amount;
          await updateGoal(goal.id, { currentAmount: newAmount });
          await mutate();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add money';
          throw new Error(errorMessage);
        }
      },
    });
  };

  const handleDelete = (goal: Goal) => {
    NiceModal.show(DeleteConfirmModal, {
      goal,
      onConfirm: async () => {
        try {
          await deleteGoal(goal.id);
          await mutate();
          toaster.create({
            title: 'Goal deleted',
            description: 'Your goal has been deleted successfully',
            type: 'success',
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete goal';
          toaster.create({
            title: 'Error',
            description: errorMessage,
            type: 'error',
          });
        }
      },
    });
  };

  const handleMobileAction = (goal: Goal) => {
    NiceModal.show(GoalActionSheet, {
      goal,
      onAddMoney: () => handleAddMoney(goal),
      onEdit: () => handleEdit(goal),
      onDelete: () => handleDelete(goal),
    });
  };

  const handleSave = async (
    data: {
      title: string;
      description?: string;
      targetAmount: number;
      targetDate?: string;
    },
    goalId?: string
  ) => {
    try {
      if (goalId) {
        await updateGoal(goalId, data);
      } else {
        await createGoal(data);
      }
      await mutate();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save goal';
      throw new Error(errorMessage);
    }
  };

  const formatAmount = (amount: number) => {
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    const progress = Math.min((current / target) * 100, 100);
    return Math.round(progress);
  };

  const getDaysRemaining = (targetDate: string | null | undefined) => {
    if (!targetDate) return null;
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Common emoji icons for goals
  const goalEmojis = ['🎯', '💰', '✈️', '🏠', '🚗', '💍', '🎓', '🏖️', '📱', '🎮', '💜', '⭐', '🍾', '👠', '🐷'];

  const getEmojiForGoal = (goal: Goal) => {
    // Use goal ID to consistently pick an emoji
    const index = goal.id.charCodeAt(0) % goalEmojis.length;
    return goalEmojis[index];
  };

  return (
    <DashboardLayout>
      <VStack align="stretch" gap={{ base: 4, lg: 6 }}>
        <HStack justify="space-between" align="center" flexDirection={{ base: 'column', lg: 'row' }} alignSelf={{ base: 'stretch', lg: 'auto' }} gap={{ base: 3, lg: 0 }}>
          <Box textAlign={{ base: 'center', lg: 'left' }}>
            <Heading size={{ base: '2xl', lg: '4xl' }} color="text-primary" fontWeight="bold">
              Personal Goals
            </Heading>
            <Text fontSize={{ base: 'sm', lg: 'lg' }} color="text-secondary" mt={{ base: 1, lg: 2 }}>
              Track your savings and achieve your financial targets
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
            w={{ base: '100%', lg: 'auto' }}
          >
            <HStack gap={2}>
              <Plus size={16} />
              <Text fontSize={{ base: 'xs', lg: 'sm' }}>New Goal</Text>
            </HStack>
          </Button>
        </HStack>

        {isLoading ? (
          <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' }} gap={{ base: 3, lg: 4 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} height={{ base: '150px', lg: '200px' }} borderRadius="12px" />
            ))}
          </Grid>
        ) : goals.length === 0 ? (
          <Box
            bg="bg-card"
            borderRadius="12px"
            p={{ base: 8, lg: 12 }}
            textAlign="center"
            boxShadow="shadow-card"
          >
            <Target size={36} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <Text fontSize={{ base: 'md', lg: 'lg' }} color="text-muted" mb={4}>
              No goals yet
            </Text>
            <Text fontSize={{ base: 'xs', lg: 'sm' }} color="text-secondary" mb={6}>
              Create your first financial goal to start tracking your progress
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
                <Text fontSize={{ base: 'xs', lg: 'sm' }}>Create Your First Goal</Text>
              </HStack>
            </Button>
          </Box>
        ) : (
          <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' }} gap={{ base: 3, lg: 4 }}>
            {goals.map((goal: Goal) => {
              const progress = calculateProgress(
                typeof goal.currentAmount === 'string' ? parseFloat(goal.currentAmount) : goal.currentAmount,
                typeof goal.targetAmount === 'string' ? parseFloat(goal.targetAmount) : goal.targetAmount
              );
              const backgroundColor = isDarkMode ? generateRandomColorDark(goal.id) : generateRandomColor(goal.id);
              const emoji = getEmojiForGoal(goal);
              const daysRemaining = getDaysRemaining(goal.targetDate);

              return (
                <Box
                  key={goal.id}
                  bg={backgroundColor}
                  borderRadius="12px"
                  p={{ base: 2, lg: 3 }}
                  boxShadow="shadow-card"
                  position="relative"
                  h={{ base: '150px', lg: '200px' }}
                  display="flex"
                  flexDirection="column"
                  cursor={{ base: 'pointer', lg: 'default' }}
                  onClick={(e) => {
                    if (window.innerWidth < 1024) {
                      e.stopPropagation();
                      handleMobileAction(goal);
                    }
                  }}
                  _hover={{ base: { opacity: 0.9 }, lg: {} }}
                >
                  <HStack w="max-content" align="center" mb={1} gap={{ base: 1.5, lg: 3 }}>
                    <Text
                      fontSize={{ base: '10px', lg: 'sm' }}
                      fontWeight="bold"
                      color={progress > 50 ? 'white' : 'text-primary'}
                      flex="1"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                      truncate="true"
                      maxWidth={{ base: '80px', lg: '130px' }}
                    >
                      {goal.title}
                    </Text>
                    <Text fontSize={{ base: '12px', lg: 'xl' }}>{emoji}</Text>
                  </HStack>

                  {/* Description */}
                  {goal.description && (
                    <Text
                      fontSize={{ base: '9px', lg: '2xs' }}
                      color={progress > 50 ? 'whiteAlpha.800' : 'text-secondary'}
                      mb={1.5}
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                    >
                      {goal.description}
                    </Text>
                  )}

                  <VStack align="stretch" gap={0.5} mt="auto">
                    <HStack justify="space-between">
                      <Text
                        fontSize={{ base: '9px', lg: 'xs' }}
                        fontWeight="medium"
                        color={progress > 50 ? 'whiteAlpha.900' : 'text-secondary'}
                      >
                        Saved
                      </Text>
                      <Text
                        fontSize={{ base: '9px', lg: 'xs' }}
                        fontWeight="bold"
                        color={progress > 50 ? 'white' : 'text-primary'}
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                      >
                        {formatAmount(
                          typeof goal.currentAmount === 'string'
                            ? parseFloat(goal.currentAmount)
                            : goal.currentAmount
                        )}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text
                        fontSize={{ base: '9px', lg: '2xs' }}
                        fontWeight="medium"
                        color={isDarkMode ? 'whiteAlpha.900' : 'text-primary'}
                      >
                        Target
                      </Text>
                      <Text
                        fontSize={{ base: '9px', lg: '2xs' }}
                        fontWeight="bold"
                        color={isDarkMode ? 'white' : 'text-primary'}
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                      >
                        {formatAmount(
                          typeof goal.targetAmount === 'string'
                            ? parseFloat(goal.targetAmount)
                            : goal.targetAmount
                        )}
                      </Text>
                    </HStack>

                    {/* Progress Bar */}
                    <Box
                      bg={isDarkMode ? 'blackAlpha.400' : 'blackAlpha.300'}
                      borderRadius="full"
                      height={{ base: '2px', lg: '4px' }}
                      overflow="hidden"
                      mt={0.5}
                    >
                      <Box
                        bg={isDarkMode ? 'white' : 'text-primary'}
                        height="100%"
                        width={`${progress}%`}
                        transition="width 0.3s ease"
                      />
                    </Box>

                    {/* Days Remaining */}
					<HStack justifyContent="space-between">
                    {daysRemaining !== null && (
						<Text
                        fontSize={{ base: '9px', lg: '2xs' }}
                        fontWeight="medium"
                        color={isDarkMode ? 'whiteAlpha.900' : 'text-primary'}
                        mt={0.5}
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
						>
                        {daysRemaining > 0
                          ? `${daysRemaining} days left`
                          : 'Deadline passed'}
                      </Text>
                    )}
					{progress > 0 && (
                      <Box
                        bg={isDarkMode ? 'blackAlpha.700' : 'whiteAlpha.900'}
                        borderRadius="full"
                        px={{ base: 1, lg: 2 }}
                        py={0.5}
                        fontSize={{ base: '9px', lg: '2xs' }}
                        fontWeight="bold"
                        color={isDarkMode ? 'white' : 'text-primary'}
                      >
                        {progress}%
                      </Box>
                    )}
					</HStack>
                  </VStack>

                  {/* Kebab Menu - Desktop Only */}
                  <Box position="absolute" top={2} right={2} zIndex={10} display={{ base: 'none', lg: 'block' }}>
                    <Menu.Root>
                      <Menu.Trigger asChild>
                        <IconButton
                          aria-label="Goal menu"
                          variant="ghost"
                          size="xs"
                          color={progress > 50 ? 'white' : 'text-primary'}
                          _hover={{
                            bg: progress > 50 ? 'whiteAlpha.200' : 'bg-hover',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <MoreVertical size={14} />
                        </IconButton>
                      </Menu.Trigger>
                      <Portal>
                        <Menu.Positioner>
                          <Menu.Content minW="150px">
                            <Menu.Item value="add-money" onClick={() => handleAddMoney(goal)}>
                              <DollarSign size={14} />
                              <Box flex="1">Add Money</Box>
                            </Menu.Item>
                            <Menu.Item value="edit-goal" onClick={() => handleEdit(goal)}>
                              <Edit size={14} />
                              <Box flex="1">Edit Goal</Box>
                            </Menu.Item>
                            <Menu.Separator />
                            <Menu.Item value="delete-goal" color="red.500" onClick={() => handleDelete(goal)}>
                              <Trash2 size={14} />
                              <Box flex="1">Delete Goal</Box>
                            </Menu.Item>
                          </Menu.Content>
                        </Menu.Positioner>
                      </Portal>
                    </Menu.Root>
                  </Box>
                </Box>
              );
            })}
          </Grid>
        )}
      </VStack>
    </DashboardLayout>
  );
}

