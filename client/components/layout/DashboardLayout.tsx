'use client';

import { Box, Flex, Spinner } from '@chakra-ui/react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <Flex minH="100vh" bg="bg-primary" alignItems="center" justifyContent="center">
        <Spinner size="lg" />
      </Flex>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <Flex minH="100vh" maxH="100vh" bg="bg-primary" overflow={{base: "auto", lg: "hidden"}} direction={{ base: 'column', lg: 'row' }}>
      {/* Desktop Sidebar */}
      <Box display={{ base: 'none', lg: 'block' }}>
        <Sidebar />
      </Box>
      
      <Flex direction="column" flex={1} minW={0} position="relative">
        {/* Desktop Header */}
        <Box display={{ base: 'none', lg: 'block' }}>
          <Header />
        </Box>
        
        <Box 
          flex={1} 
          p={6}
          py={6}
          pt={{ base: 4, lg: 20 }}
          pb={{ base: 20, lg: 6 }}
          overflow="auto"
          data-scroll-container
        >
          {children}
        </Box>
        {/* Mobile bottom navigation */}
        <BottomNav />
      </Flex>
    </Flex>
  );
}
