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
