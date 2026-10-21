import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BudgetPlanner } from '../components/budget/BudgetPlanner';
import type { EventPlan, BudgetCategory } from '../types';

const mockEvent: EventPlan = {
  id: 'test-event-1',
  name: 'Test Gala 2026',
  occasion: 'college_fest',
  date: '2026-11-20',
  startTime: '18:00',
  location: 'Auditorium Hall',
  venueStatus: 'booked',
  guestCount: 200,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  budget: {
    currency: 'INR',
    total: 100000,
    categories: [
      {
        id: 'cat-1',
        name: 'Venue & Staging',
        amount: 40000,
        percentage: 40,
        reason: 'Main auditorium rental',
        priority: 'high',
        isProtected: true,
      },
      {
        id: 'cat-2',
        name: 'Catering & Drinks',
        amount: 35000,
        percentage: 35,
        reason: 'Buffet dinner',
        priority: 'high',
        isProtected: false,
      },
      {
        id: 'cat-3',
        name: 'Sound & Lighting',
        amount: 15000,
        percentage: 15,
        reason: 'PA and stage lights',
        priority: 'medium',
        isProtected: false,
      },
    ],
  },
  preferences: {
    theme: 'Electric Sunset',
    colorPalette: ['#FF6B6B'],
    foodPreferences: ['Buffet'],
    dietaryRequirements: ['Vegetarian'],
    atmosphere: 'casual',
    indoorOutdoor: 'indoor',
    budgetPriority: 'balanced_value',
    mustHaves: ['DJ'],
    avoid: ['Speeches'],
  },
  concept: {
    title: 'Gala Concept',
    description: 'A grand celebration',
    theme: 'Electric Sunset',
    colorPalette: ['#FF6B6B'],
    decorDirection: 'Modern',
    suggestedActivities: ['Music'],
    menuDirection: 'Continental',
    reasoning: 'Cost-effective',
    generatedBy: 'deterministic',
  },
  timeline: [],
  vendorChecklist: [],
  recommendations: [],
  guests: [],
};

describe('Budget Calculations & Allocation Logic', () => {
  it('calculates total allocated and remaining balance correctly', () => {
    const totalBudget = mockEvent.budget.total;
    const allocated = mockEvent.budget.categories.reduce((sum, c) => sum + c.amount, 0);
    const remaining = totalBudget - allocated;

    expect(totalBudget).toBe(100000);
    expect(allocated).toBe(90000);
    expect(remaining).toBe(10000);
  });

  it('correctly calculates negative remaining balance when over budget', () => {
    const overAllocatedCats: BudgetCategory[] = [
      { id: '1', name: 'Cat 1', amount: 80000, percentage: 80, reason: '', priority: 'high' },
      { id: '2', name: 'Cat 2', amount: 30000, percentage: 30, reason: '', priority: 'high' },
    ];
    const total = 100000;
    const allocated = overAllocatedCats.reduce((sum, c) => sum + c.amount, 0);
    const remaining = total - allocated;

    expect(allocated).toBe(110000);
    expect(remaining).toBe(-10000);
  });

  it('calculates category percentage accurately against total budget', () => {
    const total = 200000;
    const catAmount = 50000;
    const percentage = Math.round((catAmount / total) * 100);

    expect(percentage).toBe(25);
  });
});

describe('BudgetPlanner Component Interaction', () => {
  it('renders budget metric cards with total, allocated, and remaining amounts', () => {
    const onUpdateEvent = vi.fn();
    const openBudgetRescue = vi.fn();

    render(
      <BudgetPlanner
        event={mockEvent}
        onUpdateEvent={onUpdateEvent}
        openBudgetRescue={openBudgetRescue}
      />
    );

    // Total Planned Limit
    expect(screen.getByText('Total Planned Limit')).toBeInTheDocument();
    expect(screen.getByText(/INR[\s\S]*(100,000|1,00,000)/)).toBeInTheDocument();

    // Total Allocated
    expect(screen.getByText('Total Allocated')).toBeInTheDocument();
    expect(screen.getByText(/INR[\s\S]*(90,000|90,000)/)).toBeInTheDocument();

    // Remaining Balance
    expect(screen.getByText('Remaining Balance')).toBeInTheDocument();
    expect(screen.getByText(/INR[\s\S]*(10,000|10,000)/)).toBeInTheDocument();
  });

  it('calls onUpdateEvent when category amount is updated', () => {
    const onUpdateEvent = vi.fn();
    const openBudgetRescue = vi.fn();

    render(
      <BudgetPlanner
        event={mockEvent}
        onUpdateEvent={onUpdateEvent}
        openBudgetRescue={openBudgetRescue}
      />
    );

    // Find the input with value 40000 (Venue & Staging)
    const inputs = screen.getAllByRole('spinbutton');
    const venueInput = inputs.find((input) => (input as HTMLInputElement).value === '40000');
    expect(venueInput).toBeDefined();

    fireEvent.change(venueInput!, { target: { value: '45000' } });

    expect(onUpdateEvent).toHaveBeenCalledTimes(1);
    const updated = onUpdateEvent.mock.calls[0][0] as EventPlan;
    const updatedCat = updated.budget.categories.find((c) => c.id === 'cat-1');
    expect(updatedCat?.amount).toBe(45000);
    expect(updatedCat?.percentage).toBe(45); // 45000 / 100000 = 45%
  });

  it('toggles category protection when lock button is clicked', () => {
    const onUpdateEvent = vi.fn();
    const openBudgetRescue = vi.fn();

    render(
      <BudgetPlanner
        event={mockEvent}
        onUpdateEvent={onUpdateEvent}
        openBudgetRescue={openBudgetRescue}
      />
    );

    // First category is protected, title="Category Protected from Rescue cuts"
    const lockBtn = screen.getByTitle('Category Protected from Rescue cuts');
    fireEvent.click(lockBtn);

    expect(onUpdateEvent).toHaveBeenCalledTimes(1);
    const updated = onUpdateEvent.mock.calls[0][0] as EventPlan;
    expect(updated.budget.categories[0].isProtected).toBe(false);
  });

  it('allows adding a new budget category', () => {
    const onUpdateEvent = vi.fn();
    const openBudgetRescue = vi.fn();

    render(
      <BudgetPlanner
        event={mockEvent}
        onUpdateEvent={onUpdateEvent}
        openBudgetRescue={openBudgetRescue}
      />
    );

    const nameInput = screen.getByPlaceholderText(/New Category Name/i);
    fireEvent.change(nameInput, { target: { value: 'Return Gifts' } });

    const submitBtn = screen.getByRole('button', { name: /Add Category/i });
    fireEvent.click(submitBtn);

    expect(onUpdateEvent).toHaveBeenCalledTimes(1);
    const updated = onUpdateEvent.mock.calls[0][0] as EventPlan;
    expect(updated.budget.categories).toHaveLength(4);
    const newCat = updated.budget.categories[3];
    expect(newCat.name).toBe('Return Gifts');
    expect(newCat.amount).toBe(5000);
    expect(newCat.percentage).toBe(5);
  });

  it('allows deleting an existing category', () => {
    const onUpdateEvent = vi.fn();
    const openBudgetRescue = vi.fn();

    render(
      <BudgetPlanner
        event={mockEvent}
        onUpdateEvent={onUpdateEvent}
        openBudgetRescue={openBudgetRescue}
      />
    );

    const deleteBtns = screen.getAllByTitle('Delete Category');
    expect(deleteBtns.length).toBe(3);

    // Click delete for the first category
    fireEvent.click(deleteBtns[0]);

    expect(onUpdateEvent).toHaveBeenCalledTimes(1);
    const updated = onUpdateEvent.mock.calls[0][0] as EventPlan;
    expect(updated.budget.categories).toHaveLength(2);
    expect(updated.budget.categories.find((c) => c.id === 'cat-1')).toBeUndefined();
  });

  it('triggers openBudgetRescue when clicking Launch Rescue Mode button', () => {
    const onUpdateEvent = vi.fn();
    const openBudgetRescue = vi.fn();

    render(
      <BudgetPlanner
        event={mockEvent}
        onUpdateEvent={onUpdateEvent}
        openBudgetRescue={openBudgetRescue}
      />
    );

    const rescueBtn = screen.getByRole('button', { name: /Launch Rescue Mode/i });
    fireEvent.click(rescueBtn);

    expect(openBudgetRescue).toHaveBeenCalledTimes(1);
  });
});
