'use client';

import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from '@chakra-ui/react';
import { forwardRef } from 'react';

export interface ButtonProps extends Omit<ChakraButtonProps, 'variant'> {
  variant?: 'solid' | 'outline' | 'subtle' | 'surface' | 'ghost' | 'plain';
  colorScheme?: 'brand' | 'accent' | 'purple' | 'success' | 'error' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => {
    return (
      <ChakraButton ref={ref} {...props} borderRadius="18px">
        {children}
      </ChakraButton>
    );
  }
);

Button.displayName = 'Button';
