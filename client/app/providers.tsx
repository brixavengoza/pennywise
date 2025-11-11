'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import NiceModal from '@ebay/nice-modal-react';
import { system } from './theme';
import { SWRProvider } from '@/lib/swr-provider';
import { ColorModeProvider } from '@/components/ui/color-mode';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ChakraProvider value={system}>
        <ColorModeProvider>
          <SWRProvider>
            <NiceModal.Provider>
              {children}
            </NiceModal.Provider>
          </SWRProvider>
        </ColorModeProvider>
      </ChakraProvider>
    </SessionProvider>
  );
}
