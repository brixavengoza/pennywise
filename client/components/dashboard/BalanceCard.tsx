'use client';

import { Box, Text, HStack, Button } from '@chakra-ui/react';
import { Plus, Minus } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import NiceModal from '@ebay/nice-modal-react';
import DepositWithdrawModal from './DepositWithdrawModal';

interface BalanceCardProps {
  label: string;
  amount?: number | string;
  variant?: 'dark' | 'blue' | 'grey' | 'white';
  showButtons?: boolean;
  subtitle?: string;
  buttonLabel?: string;
}

export function BalanceCard({
  label,
  amount,
  variant = 'dark',
  showButtons = false,
  subtitle,
  buttonLabel,
}: BalanceCardProps) {
  const { symbol } = useCurrency();
  
  const bgColors = {
    dark: 'bg-balance-dark',
    blue: 'bg-balance-blue',
    grey: 'bg-balance-grey',
    white: 'bg-balance-white',
  };

  const textColors = {
    dark: 'text-balance-dark',
    blue: 'text-balance-blue',
    grey: 'text-balance-grey',
    white: 'text-balance-white',
  };

  const labelColors = {
    dark: 'text-label-opacity',
    blue: 'text-label-opacity',
    grey: 'text-label-opacity-dark',
    white: 'text-label-opacity-dark',
  };

  const bg = bgColors[variant];
  const textColor = textColors[variant];
  const labelColor = labelColors[variant];

  const formatAmount = (value: number | string | undefined) => {
    if (value === undefined || value === null) {
      return `${symbol}0.00`;
    }
    if (typeof value === 'string') {
      return value;
    }
    return `${symbol}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Box
      bg={bg}
      borderRadius="8px"
      p={{ base: 3, lg: 4 }}
      boxShadow="sm"
      minH={{ base: '120px', lg: '140px' }}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      <Text border="1px solid" w="max-content" p={{ base: '2px 6px', lg: '3px 8px' }} borderRadius="18px" fontSize={{ base: '2xs', lg: 'xs' }} color={labelColor} mb={{ base: 1, lg: 2 }}>
        {label}
      </Text>
      
      {amount !== undefined && (
        <Text fontSize={{ base: '2xl', lg: '4xl' }} fontWeight="bold" color={textColor} mb={subtitle ? { base: 1, lg: 2 } : 0}>
          {formatAmount(amount)}
        </Text>
      )}

      {subtitle && (
        <Text fontSize={{ base: 'sm', lg: 'lg' }} fontWeight="semibold" color={textColor} mb={{ base: 2, lg: 4 }}>
          {subtitle}
        </Text>
      )}

      {showButtons && (
        <HStack gap={{ base: 1.5, lg: 2 }} mt={{ base: 2, lg: 4 }}>
          <Button
            size={{ base: 'xs', lg: 'sm' }}
            bg="bg-overlay"
            color="text-balance-dark"
            border="1px solid"
            borderColor="border-overlay"
            borderRadius="18px"
            _hover={{ bg: 'bg-overlay-hover' }}
            flex={1}
            onClick={() => {
              NiceModal.show(DepositWithdrawModal, { type: 'INCOME' });
            }}
          >
            <Plus size={14} style={{ marginRight: '4px' }} />
            Deposit
          </Button>
          <Button
            size={{ base: 'xs', lg: 'sm' }}
            bg="bg-overlay"
            color="text-balance-dark"
            border="1px solid"
            borderColor="border-overlay"
            borderRadius="18px"
            _hover={{ bg: 'bg-overlay-hover' }}
            flex={1}
            onClick={() => {
              NiceModal.show(DepositWithdrawModal, { type: 'EXPENSE' });
            }}
          >
            <Minus size={14} style={{ marginRight: '4px' }} />
            Withdraw
          </Button>
        </HStack>
      )}

      {buttonLabel && (
        <Button
          size={{ base: 'xs', lg: 'sm' }}
          bg="button-primary"
          color="button-text"
          borderRadius="18px"
          mt={{ base: 2, lg: 4 }}
          _hover={{ bg: 'button-primary-hover' }}
        >
          {buttonLabel}
        </Button>
      )}
    </Box>
  );
}
