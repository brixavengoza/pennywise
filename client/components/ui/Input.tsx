'use client';

import {
  Input as ChakraInput,
  InputProps as ChakraInputProps,
} from '@chakra-ui/react';
import { forwardRef, ReactNode } from 'react';
import { Box, Text } from '@chakra-ui/react';

export interface InputProps extends ChakraInputProps {
  label?: string;
  error?: string;
  isRequired?: boolean;
  leftElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, isRequired, leftElement, ...props }, ref) => {
    return (
      <Box position="relative">
        {label && (
          <Text fontSize={{ base: 'xs', lg: 'sm' }} fontWeight="medium" mb={{ base: 1.5, lg: 2 }} color="text-primary">
            {label}
            {isRequired && <Text as="span" color="error"> *</Text>}
          </Text>
        )}
        <Box position="relative">
          {leftElement && (
            <Box
              position="absolute"
              left="0"
              top="50%"
              transform="translateY(-50%)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              pl={3}
              zIndex={1}
              pointerEvents="none"
              color="text-muted"
            >
              {leftElement}
            </Box>
          )}
          <ChakraInput
            ref={ref}
            pl={leftElement ? { base: 8, lg: 10 } : undefined}
            borderColor={error ? 'error' : undefined}
            {...props}
          />
        </Box>
        {error && (
          <Text fontSize="sm" color="error" mt={1}>
            {error}
          </Text>
        )}
      </Box>
    );
  }
);

Input.displayName = 'Input';
