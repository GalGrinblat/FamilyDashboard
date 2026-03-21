import { describe, it, expect } from 'vitest';
import { formatCurrency, getAmountColorClass, getBadgeColorClass, cn } from './utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('merges tailwind conflicts correctly', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });
});

describe('formatCurrency', () => {
  it('formats a positive amount with shekel sign', () => {
    expect(formatCurrency(1000)).toBe('₪1,000');
  });

  it('formats a negative amount with minus before shekel', () => {
    expect(formatCurrency(-500)).toBe('-₪500');
  });

  it('shows a plus sign when showSign is true', () => {
    expect(formatCurrency(2000, true)).toBe('+₪2,000');
  });

  it('does not show a plus sign for negative values even with showSign', () => {
    expect(formatCurrency(-200, true)).toBe('-₪200');
  });

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('₪0');
  });
});

describe('getAmountColorClass', () => {
  it('returns green classes for income', () => {
    expect(getAmountColorClass('income')).toContain('emerald');
  });

  it('returns red classes for expense', () => {
    expect(getAmountColorClass('expense')).toContain('rose');
  });

  it('defaults to expense color for unknown types', () => {
    expect(getAmountColorClass('other')).toContain('rose');
  });
});

describe('getBadgeColorClass', () => {
  it('returns green badge classes for income', () => {
    expect(getBadgeColorClass('income')).toContain('emerald');
  });

  it('returns red badge classes for expense', () => {
    expect(getBadgeColorClass('expense')).toContain('rose');
  });
});
