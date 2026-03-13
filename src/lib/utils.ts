import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a monetary amount in Israeli Shekel (₪).
 * The ₪ sign is placed to the left of the number.
 * For negative values the minus sign appears to the left of ₪, e.g. -₪4,000.
 * For positive values with showSign=true a plus sign is added, e.g. +₪4,000.
 */
export function formatCurrency(amount: number, showSign = false): string {
  const absFormatted = Math.abs(amount).toLocaleString();
  if (amount < 0) return `-₪${absFormatted}`;
  if (showSign) return `+₪${absFormatted}`;
  return `₪${absFormatted}`;
}
/**
 * Returns the CSS classes for amount text colors based on the type.
 */
export function getAmountColorClass(type: 'income' | 'expense' | string): string {
  if (type === 'income') return 'text-emerald-600 dark:text-emerald-400';
  return 'text-rose-600 dark:text-rose-400';
}

/**
 * Returns the CSS classes for badge colors based on the type.
 */
export function getBadgeColorClass(type: 'income' | 'expense' | string): string {
  if (type === 'income') {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20';
  }
  return 'bg-rose-50 text-rose-700 ring-rose-600/10 dark:bg-rose-400/10 dark:text-rose-400 dark:ring-rose-400/20';
}
