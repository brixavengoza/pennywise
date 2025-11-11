/**
 * Utility Functions
 * 
 * General utility functions used across the application
 */

import { format, parseISO } from 'date-fns';

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date string to a readable format
 */
export function formatDate(date: string | Date, formatStr: string = 'MMM dd, yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format a date with time
 */
export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
}

/**
 * Format a number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Truncate text to a specific length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Combine class names (useful for conditional classes)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

