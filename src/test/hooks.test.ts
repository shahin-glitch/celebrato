import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBudgetCalculation } from '../hooks/useBudgetCalculation';
import { useNotifications } from '../hooks/useNotifications';
import { useEventPlan } from '../hooks/useEventPlan';
import type { BudgetCategory } from '../types';

describe('useBudgetCalculation Hook', () => {
  const categories: BudgetCategory[] = [
    { id: '1', name: 'Venue', amount: 50000, percentage: 50, reason: '', priority: 'high', isProtected: true },
    { id: '2', name: 'Catering', amount: 30000, percentage: 30, reason: '', priority: 'medium', isProtected: false },
    { id: '3', name: 'Decor', amount: 20000, percentage: 20, reason: '', priority: 'low', isProtected: false },
  ];

  it('correctly calculates total, allocated, and remaining balance', () => {
    const { result } = renderHook(() => useBudgetCalculation(100000, categories, 'INR'));

    expect(result.current.totalBudget).toBe(100000);
    expect(result.current.allocatedBudget).toBe(100000);
    expect(result.current.remainingBalance).toBe(0);
    expect(result.current.isBalanced).toBe(true);
    expect(result.current.isOverBudget).toBe(false);
    expect(result.current.currencySymbol).toBe('₹');
  });

  it('detects over-budget allocations with negative balance', () => {
    const { result } = renderHook(() => useBudgetCalculation(80000, categories, 'USD'));

    expect(result.current.totalBudget).toBe(80000);
    expect(result.current.allocatedBudget).toBe(100000);
    expect(result.current.remainingBalance).toBe(-20000);
    expect(result.current.isOverBudget).toBe(true);
    expect(result.current.isBalanced).toBe(false);
    expect(result.current.currencySymbol).toBe('$');
  });

  it('filters protected vs non-protected categories correctly', () => {
    const { result } = renderHook(() => useBudgetCalculation(100000, categories, 'INR'));

    expect(result.current.protectedCategories).toHaveLength(1);
    expect(result.current.protectedCategories[0].name).toBe('Venue');
    expect(result.current.nonProtectedCategories).toHaveLength(2);
  });
});

describe('useNotifications Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with default notifications and counts unread', () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.notifications.length).toBeGreaterThan(0);
    expect(result.current.unreadCount).toBeGreaterThan(0);
  });

  it('marks all notifications as read', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.markAllAsRead();
    });

    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications.every((n) => n.read)).toBe(true);
  });

  it('marks a single notification as read', () => {
    const { result } = renderHook(() => useNotifications());
    const targetId = result.current.notifications[0].id;

    act(() => {
      result.current.markAsRead(targetId);
    });

    const updated = result.current.notifications.find((n) => n.id === targetId);
    expect(updated?.read).toBe(true);
  });
});

describe('useEventPlan Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with sample demo events when storage is empty', () => {
    const { result } = renderHook(() => useEventPlan());

    expect(result.current.events.length).toBe(3);
    expect(result.current.activeEvent).not.toBeNull();
    expect(result.current.activeEvent?.name).toBe('Campus Cultural Night');
  });

  it('updates an active event and persists change', () => {
    const { result } = renderHook(() => useEventPlan());
    const initial = result.current.activeEvent!;

    const updated = { ...initial, name: 'Renamed Gala Night' };

    act(() => {
      result.current.updateEvent(updated);
    });

    expect(result.current.activeEvent?.name).toBe('Renamed Gala Night');
  });
});
