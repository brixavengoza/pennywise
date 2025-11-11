import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

/**
 * Custom Theme Configuration
 * 
 * Defines custom colors and semantic tokens for light/dark mode
 * Default mode: Light
 * Default border radius: 8px (set globally in CSS)
 * Sidebar is always dark regardless of theme mode
 */

// Theme configuration with custom colors and semantic tokens
const customConfig = defineConfig({
  theme: {
    tokens: {
      radii: {
        sm: { value: '4px' },
        md: { value: '8px' },
        lg: { value: '12px' },
        xl: { value: '16px' },
        '2xl': { value: '20px' },
        full: { value: '9999px' },
      },
    },
    semanticTokens: {
      colors: {
        // Background colors - Light mode (default) / Dark mode
        'bg-primary': {
          value: { _light: '#F7F7F7', _dark: '#1A202C' }, // Light gray / Dark gray
        },
        'bg-secondary': {
          value: { _light: '#F8F9FA', _dark: '#2D3748' }, // Light gray / Medium dark gray
        },
        'bg-sidebar': {
          value: '#1A202C', // Always dark (doesn't change with theme)
        },
        'bg-card': {
          value: { _light: '#FFFFFF', _dark: '#2D3748' }, // White / Medium dark gray
        },
        'bg-badge': {
          value: { _light: '#1A202C', _dark: '#1A202C' }, // Badge background (always dark)
        },
        'bg-balance-dark': {
          value: { _light: '#1A202C', _dark: '#2D3748' }, // Dark balance card variant
        },
        'bg-balance-blue': {
          value: { _light: '#0073E6', _dark: '#3182CE' }, // Blue balance card variant
        },
        'bg-balance-grey': {
          value: { _light: '#E2E8F0', _dark: '#4A5568' }, // Grey balance card variant
        },
        'bg-balance-white': {
          value: { _light: '#FFFFFF', _dark: '#2D3748' }, // White balance card variant
        },
        'bg-progress-default': {
          value: { _light: '#E2E8F0', _dark: '#4A5568' }, // Progress bar background
        },
        'bg-hover': {
          value: { _light: 'rgba(0, 0, 0, 0.05)', _dark: 'rgba(255, 255, 255, 0.1)' }, // Hover state
        },
        'bg-overlay': {
          value: { _light: 'rgba(255, 255, 255, 0.1)', _dark: 'rgba(255, 255, 255, 0.1)' }, // Overlay/button backgrounds
        },
        'bg-overlay-hover': {
          value: { _light: 'rgba(255, 255, 255, 0.2)', _dark: 'rgba(255, 255, 255, 0.2)' }, // Overlay hover state
        },
        
        // Text colors
        'text-primary': {
          value: { _light: '#1A202C', _dark: '#F7FAFC' }, // Dark gray / Almost white
        },
        'text-secondary': {
          value: { _light: '#4A5568', _dark: '#E2E8F0' }, // Medium gray / Light gray
        },
        'text-muted': {
          value: { _light: '#718096', _dark: '#A0AEC0' }, // Light gray / Medium gray
        },
        'text-badge': {
          value: { _light: 'white', _dark: 'white' }, // Badge text (always white)
        },
        'text-balance-dark': {
          value: { _light: 'white', _dark: 'white' }, // Text on dark balance card
        },
        'text-balance-blue': {
          value: { _light: 'white', _dark: 'white' }, // Text on blue balance card
        },
        'text-balance-grey': {
          value: { _light: '#1A202C', _dark: '#F7FAFC' }, // Text on grey balance card
        },
        'text-balance-white': {
          value: { _light: '#1A202C', _dark: '#F7FAFC' }, // Text on white balance card
        },
        'text-label-opacity': {
          value: { _light: 'rgba(255, 255, 255, 0.8)', _dark: 'rgba(255, 255, 255, 0.8)' }, // Label text with opacity
        },
        'text-label-opacity-dark': {
          value: { _light: 'rgba(0, 0, 0, 0.6)', _dark: 'rgba(255, 255, 255, 0.6)' }, // Label text dark variant
        },
        'text-chart-tick': {
          value: { _light: '#718096', _dark: '#A0AEC0' }, // Chart axis tick labels
        },
        'text-progress-dark': {
          value: { _light: '#4A5568', _dark: '#CBD5E0' }, // Text on progress bar (dark sections)
        },
        'text-progress-light': {
          value: { _light: 'white', _dark: 'white' }, // Text on progress bar (light sections)
        },
        
        // Border colors
        'border-color': {
          value: { _light: '#E2E8F0', _dark: '#4A5568' }, // Light border / Dark border
        },
        'border-table': {
          value: { _light: 'rgba(0, 0, 0, 0.1)', _dark: 'rgba(255, 255, 255, 0.1)' }, // Table borders
        },
        'border-table-row': {
          value: { _light: 'rgba(0, 0, 0, 0.05)', _dark: 'rgba(255, 255, 255, 0.05)' }, // Table row borders
        },
        'border-overlay': {
          value: { _light: 'rgba(255, 255, 255, 0.2)', _dark: 'rgba(255, 255, 255, 0.2)' }, // Overlay borders
        },
        'border-chart-grid': {
          value: { _light: 'rgba(0, 0, 0, 0.05)', _dark: 'rgba(255, 255, 255, 0.1)' }, // Chart grid lines
        },
        'border-chart-tooltip': {
          value: { _light: 'rgba(255, 255, 255, 0.1)', _dark: 'rgba(255, 255, 255, 0.2)' }, // Chart tooltip border
        },
        
        // Brand colors (consistent across modes)
        'brand-primary': {
          value: '#0073E6', // Primary blue
        },
        'brand-accent': {
          value: '#FFC441', // Primary yellow
        },
        'brand-purple': {
          value: '#8B5CF6', // Purple
        },
        
        // Chart colors
        'chart-income': {
          value: { _light: '#0073E6', _dark: '#4299E1' }, // Income line color
        },
        'chart-income-fill': {
          value: { _light: 'rgba(0, 115, 230, 0.6)', _dark: 'rgba(66, 153, 225, 0.6)' }, // Income fill color
        },
        'chart-expenses': {
          value: { _light: '#FFC441', _dark: '#F6AD55' }, // Expenses line color
        },
        'chart-expenses-fill': {
          value: { _light: 'rgba(255, 196, 65, 0.6)', _dark: 'rgba(246, 173, 85, 0.6)' }, // Expenses fill color
        },
        'chart-bg': {
          value: { _light: 'rgba(0, 0, 0, 0.85)', _dark: 'rgba(0, 0, 0, 0.9)' }, // Chart tooltip background
        },
        'chart-point-border': {
          value: { _light: '#FFFFFF', _dark: '#FFFFFF' }, // Chart point border
        },
        
        // Budget colors
        'budget-total': {
          value: { _light: '#0073E6', _dark: '#4299E1' }, // Total budget color
        },
        'budget-spent': {
          value: { _light: '#FFC441', _dark: '#F6AD55' }, // Spent budget color
        },
        'budget-remaining': {
          value: { _light: '#E2E8F0', _dark: '#4A5568' }, // Remaining budget color
        },
        'budget-progress-divider': {
          value: { _light: 'rgba(255, 255, 255, 0.4)', _dark: 'rgba(255, 255, 255, 0.3)' }, // Progress bar divider
        },
        'budget-progress-shadow': {
          value: { _light: 'inset 2px 0 4px rgba(0,0,0,0.1)', _dark: 'inset 2px 0 4px rgba(0,0,0,0.2)' }, // Progress bar shadow
        },
        
        // Status colors
        'success': {
          value: { _light: '#10B981', _dark: '#34D399' }, // Green - lighter in dark mode
        },
        'error': {
          value: { _light: '#EF4444', _dark: '#F87171' }, // Red - lighter in dark mode
        },
        'warning': {
          value: { _light: '#F59E0B', _dark: '#FBBF24' }, // Orange - lighter in dark mode
        },
        
        // Shadow colors
        'shadow-sm': {
          value: { _light: 'sm', _dark: 'lg' }, // Small shadow (Chakra token)
        },
        'shadow-card': {
          value: { _light: 'sm', _dark: 'xl' }, // Card shadow
        },
        'shadow-inset': {
          value: { _light: 'inset 0 2px 6px rgba(0,0,0,0.08)', _dark: 'inset 0 2px 6px rgba(0,0,0,0.2)' }, // Inset shadow
        },
        
        // Sidebar colors (always dark regardless of theme)
        'sidebar-bg': {
          value: '#1A202C', // Sidebar background
        },
        'sidebar-active': {
          value: '#000000', // Active sidebar item
        },
        'sidebar-hover': {
          value: 'rgba(0, 0, 0, 0.05)', // Sidebar hover state
        },
        'sidebar-text-active': {
          value: 'white', // Active sidebar text
        },
        'sidebar-text-inactive': {
          value: { _light: '#000000', _dark: 'rgba(255, 255, 255, 0.8)' }, // Inactive sidebar text
        },
        'sidebar-icon-active': {
          value: 'white', // Active sidebar icon
        },
        'sidebar-icon-inactive': {
          value: { _light: '#000000', _dark: 'rgba(255, 255, 255, 0.8)' }, // Inactive sidebar icon
        },
        
        // Avatar/Icon colors
        'avatar-bg': {
          value: { _light: '#1A202C', _dark: '#2D3748' }, // Avatar background
        },
        'avatar-text': {
          value: 'white', // Avatar text
        },
        
        // Button colors
        'button-primary': {
          value: { _light: '#1A202C', _dark: '#2D3748' }, // Primary button background
        },
        'button-primary-hover': {
          value: { _light: '#2D3748', _dark: '#4A5568' }, // Primary button hover
        },
        'button-text': {
          value: 'white', // Button text
        },
      },
    },
  },
});

// Create system with default config and custom theme
export const system = createSystem(defaultConfig, customConfig);
