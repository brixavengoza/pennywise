import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ColorMode = 'light' | 'dark';

interface ColorModeState {
  colorMode: ColorMode;
  toggleColorMode: () => void;
  setColorMode: (mode: ColorMode) => void;
}

export const useColorMode = create<ColorModeState>()(
  persist(
    (set) => ({
      colorMode: 'light', // Default to light mode
      toggleColorMode: () => {
        set((state) => {
          const newMode = state.colorMode === 'light' ? 'dark' : 'light';
          // Update HTML attributes for theme switching
          if (typeof window !== 'undefined') {
            document.documentElement.setAttribute('data-theme', newMode);
            document.documentElement.setAttribute('data-color-mode', newMode);
          }
          return { colorMode: newMode };
        });
      },
      setColorMode: (mode: ColorMode) => {
        set({ colorMode: mode });
        // Update HTML attributes for theme switching
        if (typeof window !== 'undefined') {
          document.documentElement.setAttribute('data-theme', mode);
          document.documentElement.setAttribute('data-color-mode', mode);
        }
      },
    }),
    {
      name: 'pennywise-color-mode', // localStorage key
      onRehydrateStorage: () => (state) => {
        // Set theme attributes when rehydrating from localStorage
        if (state && typeof window !== 'undefined') {
          document.documentElement.setAttribute('data-theme', state.colorMode);
          document.documentElement.setAttribute('data-color-mode', state.colorMode);
        }
      },
    }
  )
);
