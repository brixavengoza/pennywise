'use client';

import {
  VStack,
  HStack,
  Text,
  Box,
} from '@chakra-ui/react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Button } from '@/components/ui/Button';
import { Goal } from '@/types';
import { DollarSign, Edit, Trash2 } from 'lucide-react';

interface GoalActionSheetProps {
  goal: Goal;
  onAddMoney: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default NiceModal.create<GoalActionSheetProps>(({ goal, onAddMoney, onEdit, onDelete }) => {
  const modal = useModal();

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
      display={{ base: 'flex', lg: 'none' }}
      alignItems="flex-end"
      justifyContent="center"
      onClick={() => modal.hide()}
    >
      <Box
        bg="bg-card"
        borderRadius="16px 16px 0 0"
        p={4}
        w="100%"
        maxH="50vh"
        overflowY="auto"
        boxShadow="xl"
        onClick={(e) => e.stopPropagation()}
        position="fixed"
        bottom={0}
        left={0}
        right={0}
      >
        <VStack gap={3} align="stretch">
          <Text fontSize="sm" fontWeight="medium" color="text-secondary" textAlign="center" mb={1}>
            {goal.title}
          </Text>
          
          <VStack gap={2} align="stretch">
            <Button
              variant="ghost"
              justifyContent="flex-start"
              size="sm"
              fontSize="sm"
              px={4}
              py={3}
              onClick={() => {
                modal.hide();
                onAddMoney();
              }}
            >
              <HStack gap={3} w="100%">
                <DollarSign size={18} />
                <Text flex="1" textAlign="left">Add Money</Text>
              </HStack>
            </Button>
            
            <Button
              variant="ghost"
              justifyContent="flex-start"
              size="sm"
              fontSize="sm"
              px={4}
              py={3}
              onClick={() => {
                modal.hide();
                onEdit();
              }}
            >
              <HStack gap={3} w="100%">
                <Edit size={18} />
                <Text flex="1" textAlign="left">Edit Goal</Text>
              </HStack>
            </Button>
            
            <Button
              variant="ghost"
              justifyContent="flex-start"
              size="sm"
              fontSize="sm"
              px={4}
              py={3}
              color="red.500"
              onClick={() => {
                modal.hide();
                onDelete();
              }}
            >
              <HStack gap={3} w="100%">
                <Trash2 size={18} />
                <Text flex="1" textAlign="left">Delete Goal</Text>
              </HStack>
            </Button>
          </VStack>
          
          <Button
            variant="outline"
            size="sm"
            fontSize="sm"
            px={4}
            py={3}
            mt={2}
            onClick={() => modal.hide()}
          >
            Cancel
          </Button>
        </VStack>
      </Box>
    </Box>
  );
});

