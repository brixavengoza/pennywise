'use client';

import { Box, BoxProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

export interface CardProps extends BoxProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
}

export function Card({ children, variant = 'default', ...props }: CardProps) {
  const styles = {
    default: {
      bg: 'bg-card',
      borderRadius: 'xl',
      p: 6,
    },
    elevated: {
      bg: 'bg-card',
      borderRadius: 'xl',
      p: 6,
      boxShadow: 'lg',
    },
    outlined: {
      bg: 'bg-card',
      borderRadius: 'xl',
      p: 6,
      borderWidth: '1px',
      borderColor: 'border-color',
    },
  };

  return (
    <Box {...styles[variant]} {...props}>
      {children}
    </Box>
  );
}

