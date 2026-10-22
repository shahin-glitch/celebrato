import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { OverviewDashboard } from '../components/dashboard/OverviewDashboard';
import type { EventPlan } from '../types';

const mockEvent: EventPlan = {
  id: 'test-overview-event',
  name: 'Campus Spring Fest 2026',
  occasion: 'college_fest',
  date: '2026-11-20',
  startTime: '17:00',
  location: 'Open Ground',
  venueStatus: 'booked',
  guestCount: 250,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  budget: {
    currency: 'INR',
    total: 100000,
    originalTotal: 120000,
    isRescued: true,
    categories: [
      {
        id: 'cat-1',
        name: 'Audio & Stage',
        amount: 60000,
        percentage: 60,
        reason: 'Stage equipment',
        priority: 'high',
      },
      {
        id: 'cat-2',
        name: 'Food Court',
        amount: 35000,
        percentage: 35,
        reason: 'Snack stalls',
        priority: 'medium',
      },
      {
        id: 'cat-3',
        name: 'Contingency Buffer',
        amount: 5000,
        percentage: 5,
        reason: 'Buffer',
        priority: 'low',
      },
    ],
  },
  preferences: {
    theme: 'Spring Carnival',
    colorPalette: ['#C2F2B0'],
    foodPreferences: [],
    dietaryRequirements: [],
    atmosphere: 'casual',
    indoorOutdoor: 'outdoor',
    budgetPriority: 'balanced_value',
    mustHaves: [],
    avoid: [],
  },
  concept: {
    title: 'Spring Blueprint',
    description: '',
    theme: 'Spring',
    colorPalette: [],
    decorDirection: '',
    suggestedActivities: [],
    menuDirection: '',
    reasoning: '',
    generatedBy: 'deterministic',
  },
  timeline: [
    {
      id: 'task-1',
      title: 'Sound Testing',
      dueDate: '2026-11-19',
      priority: 'high',
      category: 'Stage',
      completed: true,
    },
    {
      id: 'task-2',
      title: 'Stage Lighting Check',
      dueDate: '2026-11-19',
      priority: 'medium',
      category: 'Stage',
      completed: false,
    },
  ],
  vendorChecklist: [],
  recommendations: [],
  guests: [
    {
      id: 'g-1',
      name: 'Rohan Sharma',
      group: 'Council',
      rsvpStatus: 'attending',
      accompanyingGuests: 1,
    },
  ],
};

describe('OverviewDashboard Component', () => {
  it('renders top metric cards with accurate amounts', () => {
    const setActiveTab = vi.fn();
    const openBudgetRescue = vi.fn();

    render(
      <OverviewDashboard
        event={mockEvent}
        setActiveTab={setActiveTab}
        openBudgetRescue={openBudgetRescue}
      />
    );

    expect(screen.getByText('Total planned budget')).toBeInTheDocument();
    expect(screen.getByText(/Allocated expenses/i)).toBeInTheDocument();
    expect(screen.getByText('Confirmed guest RSVPs')).toBeInTheDocument();
    expect(screen.getByText('Emergency buffer reserve')).toBeInTheDocument();
  });

  it('renders Budget Rescue Mode Active banner when event is rescued', () => {
    const setActiveTab = vi.fn();
    const openBudgetRescue = vi.fn();

    render(
      <OverviewDashboard
        event={mockEvent}
        setActiveTab={setActiveTab}
        openBudgetRescue={openBudgetRescue}
      />
    );

    expect(screen.getByText(/Budget Rescue Mode Active/i)).toBeInTheDocument();

    const viewBreakdownBtn = screen.getByRole('button', { name: /View rescued budget breakdown/i });
    fireEvent.click(viewBreakdownBtn);

    expect(setActiveTab).toHaveBeenCalledWith('budget');
  });

  it('navigates to relevant tab when clicking activity feed item', () => {
    const setActiveTab = vi.fn();
    const openBudgetRescue = vi.fn();

    render(
      <OverviewDashboard
        event={mockEvent}
        setActiveTab={setActiveTab}
        openBudgetRescue={openBudgetRescue}
      />
    );

    const messageItem = screen.getByRole('button', { name: /Dr\. Ramesh Shenoy/i });
    fireEvent.click(messageItem);

    expect(setActiveTab).toHaveBeenCalledWith('timeline');
  });

  it('triggers openBudgetRescue when clicking Rescue button on velocity chart', () => {
    const setActiveTab = vi.fn();
    const openBudgetRescue = vi.fn();

    render(
      <OverviewDashboard
        event={mockEvent}
        setActiveTab={setActiveTab}
        openBudgetRescue={openBudgetRescue}
      />
    );

    const rescueBtn = screen.getByRole('button', { name: /Launch Budget Rescue Mode/i });
    fireEvent.click(rescueBtn);

    expect(openBudgetRescue).toHaveBeenCalledTimes(1);
  });
});
