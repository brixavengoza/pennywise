import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Currency = 'USD' | 'EUR' | 'GBP' | 'PHP';

interface CurrencyState {
  currency: Currency;
  symbol: string;
  setCurrency: (currency: Currency) => void;
}

const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  PHP: '₱',
};

export const useCurrency = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: 'USD',
      symbol: '$',
      setCurrency: (currency: Currency) => {
        set({ currency, symbol: currencySymbols[currency] });
      },
    }),
    {
      name: 'pennywise-currency',
    }
  )
);

