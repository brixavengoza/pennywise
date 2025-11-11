'use client';

import { Box, HStack, IconButton } from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Receipt, 
  Target, 
  Flag, 
  BarChart3, 
  User
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

const navItems = [
  { label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/' },
  { label: 'Transactions', icon: <Receipt size={20} />, href: '/transactions' },
  { label: 'Budget', icon: <Target size={20} />, href: '/budget' },
  { label: 'Goals', icon: <Flag size={20} />, href: '/goals' },
  { label: 'Analytics', icon: <BarChart3 size={20} />, href: '/analytics' },
  { label: 'Profile', icon: <User size={20} />, href: '/profile' },
];

export function BottomNav() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Find the scrollable container (the main content area)
    const scrollContainer = document.querySelector('[data-scroll-container]');
    
    if (!scrollContainer) return;

    let lastScrollTop = scrollContainer.scrollTop;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollTop = scrollContainer.scrollTop;
          const scrollDifference = currentScrollTop - lastScrollTop;
          
          // Clear any existing timeout
          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
          }
          
          // If scrolling down significantly (more than 5px), hide nav
          if (scrollDifference > 5 && currentScrollTop > 50) {
            setIsVisible(false);
          } 
          // If scrolling up significantly (more than 5px), show nav
          else if (scrollDifference < -5) {
            setIsVisible(true);
          }
          
          // Always show at top
          if (currentScrollTop <= 50) {
            setIsVisible(true);
          }
          
          lastScrollTop = currentScrollTop;
          ticking = false;
        });
        ticking = true;
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Box
      display={{ base: 'block', lg: 'none' }}
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg="bg-card"
      borderTop="1px solid"
      borderColor="border-color"
      borderTopLeftRadius="10px"
      borderTopRightRadius="10px"
      zIndex={100}
      transform={isVisible ? 'translateY(0)' : 'translateY(100%)'}
      transition="transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
      willChange="transform"
    >
      <HStack
        justify="space-around"
        align="center"
        gap={0}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <IconButton
                aria-label={item.label}
                variant="ghost"
                size="2xl"
                width="70px"
                height="70px"
                color={isActive ? 'brand-primary' : 'text-muted'}
                _hover={{ 
                  color: 'brand-primary',
                  bg: 'bg-hover'
                }}
                borderRadius="full"
              >
                {item.icon}
              </IconButton>
            </Link>
          );
        })}
      </HStack>
    </Box>
  );
}

