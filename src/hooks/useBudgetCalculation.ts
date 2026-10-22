import { useMemo } from 'react';
import type { BudgetCategory, CurrencyType } from '../types';

export interface BudgetCalculationResult {
  totalBudget: number;
  allocatedBudget: number;
  remainingBalance: number;
  isOverBudget: boolean;
  isBalanced: boolean;
  protectedCategories: BudgetCategory[];
  nonProtectedCategories: BudgetCategory[];
  currencySymbol: string;
}

/**
 * Custom React hook for encapsulated, memoized event budget analytics.
 * Enforces mathematical consistency across all dashboard and planner views.
 */
export function useBudgetCalculation(
  totalBudget: number,
  categories: BudgetCategory[],
  currency: CurrencyType = 'INR'
): BudgetCalculationResult {
  return useMemo(() => {
    const allocatedBudget = categories.reduce((sum, cat) => sum + (Number(cat.amount) || 0), 0);
    const remainingBalance = totalBudget - allocatedBudget;
    const isOverBudget = remainingBalance < 0;
    const isBalanced = remainingBalance === 0;

    const protectedCategories = categories.filter((c) => c.isProtected);
    const nonProtectedCategories = categories.filter((c) => !c.isProtected);

    const currencySymbol = currency === 'INR' ? '₹' : '$';

    return {
      totalBudget,
      allocatedBudget,
      remainingBalance,
      isOverBudget,
      isBalanced,
      protectedCategories,
      nonProtectedCategories,
      currencySymbol,
    };
  }, [totalBudget, categories, currency]);
}
