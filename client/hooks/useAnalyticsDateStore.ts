import { create } from 'zustand';

interface AnalyticsDateStore {
  selectedMonth: number;
  selectedYear: number;
  startDate: string;
  endDate: string;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
  setMonthYear: (month: number, year: number) => void;
}

const calculateDates = (month: number, year: number) => {
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
  return { startDate, endDate };
};

export const useAnalyticsDateStore = create<AnalyticsDateStore>((set) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const { startDate, endDate } = calculateDates(currentMonth, currentYear);

  return {
    selectedMonth: currentMonth,
    selectedYear: currentYear,
    startDate,
    endDate,
    setMonth: (month) =>
      set((state) => {
        const { startDate, endDate } = calculateDates(month, state.selectedYear);
        return { selectedMonth: month, startDate, endDate };
      }),
    setYear: (year) =>
      set((state) => {
        const { startDate, endDate } = calculateDates(state.selectedMonth, year);
        return { selectedYear: year, startDate, endDate };
      }),
    setMonthYear: (month, year) => {
      const { startDate, endDate } = calculateDates(month, year);
      set({ selectedMonth: month, selectedYear: year, startDate, endDate });
    },
  };
});

