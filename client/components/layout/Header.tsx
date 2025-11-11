'use client';

import { Box, HStack, IconButton, Avatar } from '@chakra-ui/react';
import { Bell, HelpCircle, Moon, Sun } from 'lucide-react';
import { useColorMode } from '@/components/ui/color-mode';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect, useRef } from 'react';
import { Select } from '@chakra-ui/react';
import { createListCollection } from '@chakra-ui/react';
import { useCurrency } from '@/hooks/useCurrency';

const currencies = createListCollection({
  items: [
    { value: 'USD', label: '$ USD' },
    { value: 'EUR', label: '€ EUR' },
    { value: 'GBP', label: '£ GBP' },
    { value: 'PHP', label: '₱ PHP' },
  ],
});

export function Header() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  return (
    <Box
      as="header"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      position="absolute"
      top={5}
      right={10}
      zIndex={10}
    >
      <HStack gap={1}>
        {/* Currency Selector */}
        <Select.Root 
          collection={currencies} 
          size="sm" 
          width="100px" 
          defaultValue={[currency]}
          onValueChange={(details) => {
            const newCurrency = details.value[0] as 'USD' | 'EUR' | 'GBP';
            if (newCurrency) {
              setCurrency(newCurrency);
            }
          }}
        >
          <Select.HiddenSelect />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="$ USD" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Select.Positioner>
            <Select.Content>
              {currencies.items.map((item) => (
                <Select.Item item={item} key={item.value}>
                  {item.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>

        {/* Theme Mode Switcher */}
        <IconButton
          aria-label="Toggle theme"
          onClick={toggleColorMode}
          variant="ghost"
          size="sm"
        >
          {colorMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </IconButton>

        {/* Notifications */}
        <IconButton
          aria-label="Notifications"
          variant="ghost"
          size="sm"
        >
          <Bell size={18} />
        </IconButton>

        {/* Help */}
        <IconButton
          aria-label="Help"
          variant="ghost"
          size="sm"
        >
          <HelpCircle size={18} />
        </IconButton>

        {/* User Menu */}
        <Box position="relative" ref={menuRef}>
          <IconButton
            aria-label="User menu"
            variant="ghost"
            size="sm"
            onClick={() => setShowUserMenu(!showUserMenu)}
            p={0}
          >
            <Avatar.Root size="sm">
              <Avatar.Fallback name={user?.name || user?.email || 'User'} />
              <Avatar.Image />
            </Avatar.Root>
          </IconButton>
          
          {showUserMenu && (
            <Box
              position="absolute"
              right={0}
              top="100%"
              mt={2}
              bg="bg-card"
              border="1px solid"
              borderColor="border-color"
              borderRadius="8px"
              boxShadow="lg"
              minW="150px"
              zIndex={20}
              overflow="hidden"
            >
              <Box
                as="button"
                w="100%"
                px={4}
                py={2}
                textAlign="left"
                fontSize="sm"
                color="text-primary"
                _hover={{ bg: 'bg-hover' }}
                onClick={logout}
              >
                Logout
              </Box>
            </Box>
          )}
        </Box>
      </HStack>
    </Box>
  );
}
