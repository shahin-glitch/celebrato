import { describe, it, expect } from 'vitest';
import { generateId, formatCurrency, getCurrencySymbol } from '../utils/helpers';

describe('Utility Helpers & Pure Logic', () => {
  it('generates IDs with the specified prefix and numeric suffix', () => {
    const id = generateId('event');
    expect(id).toMatch(/^event-\d+/);
  });

  it('generates unique non-colliding IDs when called in rapid succession', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 50; i++) {
      ids.add(generateId('item'));
    }
    expect(ids.size).toBe(50);
  });

  it('formats INR currency with proper Indian numbering separation', () => {
    const formatted = formatCurrency(100000, 'INR');
    expect(formatted).toBe('₹1,00,000');
  });

  it('formats USD currency with currency symbol', () => {
    const formatted = formatCurrency(1500000, 'USD');
    expect(formatted).toBe('$15,00,000');
  });

  it('returns appropriate currency symbol for supported currencies', () => {
    expect(getCurrencySymbol('INR')).toBe('₹');
    expect(getCurrencySymbol('USD')).toBe('$');
    expect(getCurrencySymbol('EUR')).toBe('€');
  });

  it('handles negative or zero currency amounts gracefully', () => {
    expect(formatCurrency(0, 'INR')).toBe('₹0');
    expect(formatCurrency(-5000, 'INR')).toBe('₹-5,000');
  });
});
