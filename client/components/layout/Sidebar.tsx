'use client';

import { Box, Stack, Text, IconButton } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Receipt, 
  Target, 
  Flag, 
  BarChart3, 
  User, 
  Settings,
  Menu,
  X,
  Code,
} from 'lucide-react';
import { useSidebar } from '@/hooks/useSidebar';
import { useColorMode } from '@/components/ui/color-mode';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/' },
  { label: 'Transactions', icon: <Receipt size={20} />, href: '/transactions' },
  { label: 'Budget', icon: <Target size={20} />, href: '/budget' },
  { label: 'Goals', icon: <Flag size={20} />, href: '/goals' },
  { label: 'Analytics', icon: <BarChart3 size={20} />, href: '/analytics' },
  { label: 'Profile', icon: <User size={20} />, href: '#profile' },
];

const bottomNavs = [
  { label: 'Developers', icon: <Code size={20} />, href: '#developers' },
  { label: 'Settings', icon: <Settings size={20} />, href: '#settings' },
]

export function Sidebar() {
  const { isOpen, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const { colorMode } = useColorMode();

  return (
    <Box
      as="aside"
      bg="transparent"
      color="white"
      width={isOpen ? '260px' : '80px'}
      minH="100vh"
      transition="width 0.3s ease"
      position="sticky"
      top={0}
      display={{ base: 'none', lg: 'flex' }}
      flexDirection="column"
    >
      {/* Logo and Toggle */}
      <Box 
        p={4} 
        display="flex" 
        alignItems="center" 
        justifyContent={isOpen ? 'space-between' : 'center'}
        minH="70px"
      >
        {isOpen && (
          <Text fontSize="xl" fontWeight="bold" color="brand-primary">
            PennyWise
          </Text>
        )}
        <IconButton
          aria-label="Toggle sidebar"
          onClick={toggleSidebar}
          variant="ghost"
          size="sm"
          color={colorMode === 'light' ? 'sidebar-icon-inactive' : 'sidebar-icon-active'}
          _hover={{ bg: 'sidebar-hover' }}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </IconButton>
      </Box>

      {/* Navigation Items */}
      <Stack gap={1} p={4} flex={1}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Box
                display="flex"
                alignItems="center"
                gap={3}
                p={isOpen ? "8px 15px": "8px 12px" }
                borderRadius="full"
                bg={isActive ? 'sidebar-active' : 'transparent'}
                _hover={{ bg: isActive ? 'sidebar-active' : 'sidebar-hover' }}
                cursor="pointer"
                transition="all 0.2s"
              >
                <Box 
                  color={isActive ? 'sidebar-icon-active' : 'sidebar-icon-inactive'}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  minW="24px"
                >
                  {item.icon}
                </Box>
                {isOpen && (
                  <Text 
                    fontSize="sm" 
                    color={isActive ? 'sidebar-text-active' : 'sidebar-text-inactive'}
                  >
                    {item.label}
                  </Text>
                )}
              </Box>
            </Link>
          );
        })}
      </Stack>

      {/* Developer & Settings Section */}
      <Stack gap={1} p={4}>
        {bottomNavs.map((item) => {
          const isActive = pathname === item.href;
          return (
          <Link key={item.href} href={item.href}>
            <Box
              display="flex"
              alignItems="center"
              gap={3}
              p={isOpen ? "8px 15px": "8px 12px" }
              borderRadius="full"
              bg={isActive ? 'sidebar-active' : 'transparent'}
              _hover={{ bg: isActive ? 'sidebar-active' : 'sidebar-hover' }}
              cursor="pointer"
              transition="all 0.2s"
            >
              <Box 
                  color={isActive ? 'sidebar-icon-active' : 'sidebar-icon-inactive'}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  minW="24px"
                >
                  {item.icon}
                </Box>
                {isOpen && (
                  <Text fontSize="sm" color={isActive ? 'sidebar-text-active' : 'sidebar-text-inactive'}>
                    {item.label}
                  </Text>
                )}
            </Box>
          </Link>
        )})}
      </Stack>
    </Box>
  );
}
