import type { CurrencyType } from '../types';

let idCounter = 0;

/**
 * Generates a unique, stable identifier with a given prefix and numeric timestamp.
 * Guarantees prefix-digits format for backward compatibility with test assertions.
 */
export function generateId(prefix: string): string {
  idCounter = (idCounter + 1) % 1000;
  return `${prefix}-${Date.now()}${idCounter}`;
}

/**
 * Returns currency symbol for a CurrencyType.
 */
export function getCurrencySymbol(currency: CurrencyType = 'INR'): string {
  switch (currency) {
    case 'INR':
      return '₹';
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    default:
      return '₹';
  }
}

/**
 * Formats a number with currency symbol and localized number formatting.
 */
export function formatCurrency(amount: number, currency: CurrencyType = 'INR'): string {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toLocaleString()}`;
}
