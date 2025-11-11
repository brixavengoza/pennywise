import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Currency = 'USD' | 'EUR' | 'GBP' | 'PHP';

interface CurrencyState {
  currency: Currency;
  symbol: string;
  setCurrency: (currency: Currency) => void;
  formatAmount: (amount: number) => string;
}

const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  PHP: '₱',
};

export const useCurrency = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: 'USD',
      symbol: '$',
      setCurrency: (currency: Currency) => {
        set({ currency, symbol: currencySymbols[currency] });
      },
      formatAmount: (amount: number) => {
        const { symbol } = get();
        return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      },
    }),
    {
      name: 'pennywise-currency',
    }
  )
);

