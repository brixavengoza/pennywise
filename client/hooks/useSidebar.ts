import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isOpen: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
}

export const useSidebar = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: true, // Default to open
      toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
      openSidebar: () => set({ isOpen: true }),
      closeSidebar: () => set({ isOpen: false }),
    }),
    {
      name: 'pennywise-sidebar', // localStorage key
    }
  )
);
