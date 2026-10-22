import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  generateRescueSuggestions,
  calculateRebalancedCategories,
} from '../services/budgetRescue';
import { BudgetRescueModal } from '../components/budget/BudgetRescueModal';
import type { EventPlan, BudgetCategory, RescueSuggestion } from '../types';

const sampleCategories: BudgetCategory[] = [
  {
    id: 'cat-venue',
    name: 'Palace or Resort Venue',
    amount: 50000,
    percentage: 50,
    reason: 'Main venue reservation',
    priority: 'high',
    isProtected: true,
  },
  {
    id: 'cat-decor',
    name: 'Floral & Mandap Styling and Decor',
    amount: 20000,
    percentage: 20,
    reason: 'Stage decor',
    priority: 'medium',
    isProtected: false,
  },
  {
    id: 'cat-food',
    name: 'Bespoke Banquet Catering',
    amount: 20000,
    percentage: 20,
    reason: 'Buffet food',
    priority: 'high',
    isProtected: false,
  },
  {
    id: 'cat-photo',
    name: 'Cinematic Photo & Video Film',
    amount: 10000,
    percentage: 10,
    reason: 'Photography',
    priority: 'medium',
    isProtected: false,
  },
];

const mockRescueEvent: EventPlan = {
  id: 'event-rescue-1',
  name: 'Grand Gala',
  occasion: 'wedding',
  date: '2026-12-15',
  startTime: '19:00',
  location: 'Goa',
  venueStatus: 'booked',
  guestCount: 150,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  budget: {
    currency: 'INR',
    total: 100000,
    categories: sampleCategories,
  },
  preferences: {
    theme: 'Royal',
    colorPalette: ['#800020'],
    foodPreferences: [],
    dietaryRequirements: [],
    atmosphere: 'formal',
    indoorOutdoor: 'indoor',
    budgetPriority: 'balanced_value',
    mustHaves: [],
    avoid: [],
  },
  concept: {
    title: 'Blueprint',
    description: 'Desc',
    theme: 'Royal',
    colorPalette: ['#800020'],
    decorDirection: 'Floral',
    suggestedActivities: [],
    menuDirection: 'Buffet',
    reasoning: 'Tailored',
    generatedBy: 'deterministic',
  },
  timeline: [],
  vendorChecklist: [],
  recommendations: [],
  guests: [],
};

describe('Budget Rescue Calculations', () => {
  it('generates high-impact rescue suggestions for decor, catering, and photo categories', () => {
    const suggestions = generateRescueSuggestions(sampleCategories);
    expect(suggestions.length).toBeGreaterThanOrEqual(3);

    const decorSug = suggestions.find((s) => s.id === 'sug-decor');
    expect(decorSug).toBeDefined();
    // 40% of 20000 = 8000
    expect(decorSug?.proposedSavings).toBe(8000);
    expect(decorSug?.accepted).toBe(true);

    const foodSug = suggestions.find((s) => s.id === 'sug-food');
    expect(foodSug).toBeDefined();
    // 25% of 20000 = 5000
    expect(foodSug?.proposedSavings).toBe(5000);

    const photoSug = suggestions.find((s) => s.id === 'sug-photo');
    expect(photoSug).toBeDefined();
    // 35% of 10000 = 3500
    expect(photoSug?.proposedSavings).toBe(3500);
  });

  it('keeps protected categories unchanged and absorbs cuts across non-protected categories', () => {
    const target = 75000; // Reducing from 100k to 75k (25k cut)
    const suggestions = generateRescueSuggestions(sampleCategories);
    const protectedIds = ['cat-venue'];

    const rebalanced = calculateRebalancedCategories(
      sampleCategories,
      target,
      suggestions,
      protectedIds
    );

    // Sum must match EXACTLY target
    const totalSum = rebalanced.reduce((sum, c) => sum + c.amount, 0);
    expect(totalSum).toBe(target);

    // Protected category amount must remain 50,000 intact
    const venueCat = rebalanced.find((c) => c.id === 'cat-venue');
    expect(venueCat?.amount).toBe(50000);
    expect(venueCat?.percentage).toBe(Math.round((50000 / 75000) * 100)); // 67%

    // Remaining 25,000 must be distributed among non-protected categories
    const nonProtectedSum = rebalanced
      .filter((c) => c.id !== 'cat-venue')
      .reduce((sum, c) => sum + c.amount, 0);
    expect(nonProtectedSum).toBe(25000);
  });

  it('proportionally scales down protected categories when protected sum exceeds target', () => {
    // If target is 40,000 but venue alone is 50,000
    const target = 40000;
    const suggestions = generateRescueSuggestions(sampleCategories);
    const protectedIds = ['cat-venue'];

    const rebalanced = calculateRebalancedCategories(
      sampleCategories,
      target,
      suggestions,
      protectedIds
    );

    const totalSum = rebalanced.reduce((sum, c) => sum + c.amount, 0);
    expect(totalSum).toBe(target);

    const venueCat = rebalanced.find((c) => c.id === 'cat-venue');
    expect(venueCat?.amount).toBe(40000);

    // Non-protected categories should be 0
    const decorCat = rebalanced.find((c) => c.id === 'cat-decor');
    expect(decorCat?.amount).toBe(0);
  });

  it('handles edge cases where target is reduced to extreme minimum', () => {
    const target = 5000;
    const suggestions: RescueSuggestion[] = [];
    const protectedIds: string[] = [];

    const rebalanced = calculateRebalancedCategories(
      sampleCategories,
      target,
      suggestions,
      protectedIds
    );

    const totalSum = rebalanced.reduce((sum, c) => sum + c.amount, 0);
    expect(totalSum).toBe(target);
    rebalanced.forEach((cat) => {
      expect(cat.amount).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('BudgetRescueModal UI Interaction', () => {
  it('renders modal when isOpen is true with reduction goal and target budget slider', () => {
    const onClose = vi.fn();
    const onApply = vi.fn();

    render(
      <BudgetRescueModal
        isOpen={true}
        onClose={onClose}
        event={mockRescueEvent}
        onApplyRescuedPlan={onApply}
      />
    );

    expect(screen.getByText('Budget Rescue Mode')).toBeInTheDocument();
    expect(screen.getByText('Original Budget')).toBeInTheDocument();
    expect(screen.getByText('New Target Budget')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirm & Apply Rescued Budget/i })).toBeInTheDocument();
  });

  it('toggles suggestion acceptance on click and updates selected savings', () => {
    const onClose = vi.fn();
    const onApply = vi.fn();

    render(
      <BudgetRescueModal
        isOpen={true}
        onClose={onClose}
        event={mockRescueEvent}
        onApplyRescuedPlan={onApply}
      />
    );

    // Initial suggestions include decor
    const decorTitle = screen.getByText(/Switch from elaborate florals/i);
    expect(decorTitle).toBeInTheDocument();

    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    expect(checkboxes[0].checked).toBe(true);

    // Toggle off by clicking on the suggestion card
    fireEvent.click(decorTitle);
    expect(checkboxes[0].checked).toBe(false);
  });

  it('applies rescued budget plan when clicking Apply button', () => {
    const onClose = vi.fn();
    const onApply = vi.fn();

    render(
      <BudgetRescueModal
        isOpen={true}
        onClose={onClose}
        event={mockRescueEvent}
        onApplyRescuedPlan={onApply}
      />
    );

    const applyBtn = screen.getByRole('button', { name: /Confirm & Apply Rescued Budget/i });
    fireEvent.click(applyBtn);

    expect(onApply).toHaveBeenCalledTimes(1);
    const updatedEvent = onApply.mock.calls[0][0] as EventPlan;

    expect(updatedEvent.budget.isRescued).toBe(true);
    expect(updatedEvent.budget.originalTotal).toBe(100000);
    // Default 30% reduction: 70,000
    expect(updatedEvent.budget.total).toBe(70000);

    const sumCategories = updatedEvent.budget.categories.reduce((s, c) => s + c.amount, 0);
    expect(sumCategories).toBe(70000);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render when isOpen is false', () => {
    const onClose = vi.fn();
    const onApply = vi.fn();

    const { container } = render(
      <BudgetRescueModal
        isOpen={false}
        onClose={onClose}
        event={mockRescueEvent}
        onApplyRescuedPlan={onApply}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
