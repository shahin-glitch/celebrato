import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AiEventStudio } from '../components/aiStudio/AiEventStudio';
import type { EventPlan } from '../types';

const mockEvent: EventPlan = {
  id: 'test-ai-event',
  name: 'Tech Innovation Conclave 2026',
  occasion: 'college_fest',
  date: '2026-12-05',
  startTime: '10:00',
  endTime: '19:00',
  location: 'Tech Park Auditorium, Bengaluru',
  venueStatus: 'booked',
  guestCount: 300,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  budget: {
    currency: 'INR',
    total: 200000,
    categories: [
      {
        id: 'cat-1',
        name: 'Venue & Audio',
        amount: 80000,
        percentage: 40,
        reason: 'Main stage and PA system',
        priority: 'high',
        isProtected: true,
      },
      {
        id: 'cat-2',
        name: 'Food & Refreshments',
        amount: 70000,
        percentage: 35,
        reason: 'Lunch & tea counters',
        priority: 'high',
        isProtected: false,
      },
      {
        id: 'cat-3',
        name: 'Decor & Lighting',
        amount: 50000,
        percentage: 25,
        reason: 'Stage backdrop and LEDs',
        priority: 'medium',
        isProtected: false,
      },
    ],
  },
  preferences: {
    theme: 'Cyberpunk Neon Horizon',
    colorPalette: ['#00F0FF', '#7000FF', '#FF0055'],
    foodPreferences: ['Finger food', 'Mocktails'],
    dietaryRequirements: ['Vegetarian'],
    atmosphere: 'modern',
    indoorOutdoor: 'indoor',
    budgetPriority: 'balanced_value',
    mustHaves: ['Keynote Livestream'],
    avoid: ['Paper schedules'],
  },
  concept: {
    title: 'Cyberpunk Neon Conclave',
    description: 'A forward-looking celebration of engineering talent and creativity.',
    theme: 'Cyberpunk Neon Horizon',
    colorPalette: ['#00F0FF', '#7000FF', '#FF0055'],
    decorDirection: 'Futuristic geometric arches with programmable ambient LED tubes.',
    suggestedActivities: ['Keynote Showcase', 'Startup Pitch Jam', 'Robotics Demo'],
    menuDirection: 'Modern fusion buffet with live mocktail station.',
    reasoning: 'Calibrated for 300 attendees to balance technology visual appeal with food efficiency.',
    generatedBy: 'deterministic',
  },
  timeline: [
    {
      id: 'task-1',
      title: 'Confirm stage sound testing',
      dueDate: '2026-12-04',
      timeSlot: '09:00 AM',
      priority: 'high',
      category: 'Audio',
      completed: false,
      notes: 'Check all 4 wireless mics',
    },
    {
      id: 'task-2',
      title: 'Sign catering delivery SLA',
      dueDate: '2026-12-03',
      timeSlot: '02:00 PM',
      priority: 'medium',
      category: 'Food',
      completed: true,
      notes: 'Ensure warm food servers',
    },
  ],
  vendorChecklist: [
    {
      id: 'vc-1',
      category: 'Live Stage Audio',
      reason: 'Essential for clear speaker clarity in 300-seat hall',
      estimatedMin: 35000,
      estimatedMax: 45000,
      bookingDeadline: '2026-11-25',
      questions: ['Is backup battery generator available?'],
      status: 'shortlisted',
      assignedVendorName: 'Apex Audio Bengaluru',
    },
  ],
  recommendations: [
    {
      id: 'rec-1',
      title: 'Digital QR badges instead of plastic lanyards',
      description: 'Saves printing overhead while streamlining registration speed.',
      estimatedSavings: 8000,
      type: 'low_cost',
    },
  ],
  guests: [],
};

describe('AiEventStudio Component', () => {
  it('renders concept view by default with title, colors, and decor direction', () => {
    const onUpdateEvent = vi.fn();
    const openBudgetRescue = vi.fn();

    render(
      <AiEventStudio
        event={mockEvent}
        onUpdateEvent={onUpdateEvent}
        openBudgetRescue={openBudgetRescue}
      />
    );

    expect(screen.getByText('AI Event Studio')).toBeInTheDocument();
    expect(screen.getByText('Cyberpunk Neon Conclave')).toBeInTheDocument();
    expect(screen.getByText(/Futuristic geometric arches/)).toBeInTheDocument();
    expect(screen.getByText('Keynote Showcase')).toBeInTheDocument();
    expect(screen.getByText('Startup Pitch Jam')).toBeInTheDocument();
  });

  it('switches to intelligent budget subtab and allows updating category amounts', () => {
    const onUpdateEvent = vi.fn();
    const openBudgetRescue = vi.fn();

    render(
      <AiEventStudio
        event={mockEvent}
        onUpdateEvent={onUpdateEvent}
        openBudgetRescue={openBudgetRescue}
      />
    );

    const budgetTab = screen.getByRole('tab', { name: /Intelligent Budget/i });
    fireEvent.click(budgetTab);

    expect(screen.getByText('Intelligent Budget Allocation')).toBeInTheDocument();

    const inputs = screen.getAllByRole('spinbutton');
    const venueInput = inputs[0];
    fireEvent.change(venueInput, { target: { value: '90000' } });

    expect(onUpdateEvent).toHaveBeenCalledTimes(1);
    const updated = onUpdateEvent.mock.calls[0][0] as EventPlan;
    expect(updated.budget.categories[0].amount).toBe(90000);
  });

  it('allows budget rebalancing to match total limit exactly', () => {
    const onUpdateEvent = vi.fn();
    const openBudgetRescue = vi.fn();

    render(
      <AiEventStudio
        event={mockEvent}
        onUpdateEvent={onUpdateEvent}
        openBudgetRescue={openBudgetRescue}
      />
    );

    fireEvent.click(screen.getByRole('tab', { name: /Intelligent Budget/i }));

    const rebalanceBtn = screen.getByRole('button', { name: /Rebalance category budget amounts/i });
    fireEvent.click(rebalanceBtn);

    expect(onUpdateEvent).toHaveBeenCalledTimes(1);
    const updated = onUpdateEvent.mock.calls[0][0] as EventPlan;
    const sum = updated.budget.categories.reduce((s, c) => s + c.amount, 0);
    expect(sum).toBe(200000);
  });

  it('switches to timeline tab and toggles milestone task completion', () => {
    const onUpdateEvent = vi.fn();
    const openBudgetRescue = vi.fn();

    render(
      <AiEventStudio
        event={mockEvent}
        onUpdateEvent={onUpdateEvent}
        openBudgetRescue={openBudgetRescue}
      />
    );

    const timelineTab = screen.getByRole('tab', { name: /Timeline Milestones/i });
    fireEvent.click(timelineTab);

    expect(screen.getByText('Milestone Schedule')).toBeInTheDocument();
    expect(screen.getByText('Confirm stage sound testing')).toBeInTheDocument();

    const taskCheckbox = screen.getByRole('checkbox', {
      name: /Mark task Confirm stage sound testing/i,
    });
    fireEvent.click(taskCheckbox);

    expect(onUpdateEvent).toHaveBeenCalledTimes(1);
    const updated = onUpdateEvent.mock.calls[0][0] as EventPlan;
    const toggled = updated.timeline.find((t) => t.id === 'task-1');
    expect(toggled?.completed).toBe(true);
  });

  it('switches to vendor checklist tab and displays procurement details', () => {
    const onUpdateEvent = vi.fn();
    const openBudgetRescue = vi.fn();

    render(
      <AiEventStudio
        event={mockEvent}
        onUpdateEvent={onUpdateEvent}
        openBudgetRescue={openBudgetRescue}
      />
    );

    const vendorsTab = screen.getByRole('tab', { name: /Vendor Checklist/i });
    fireEvent.click(vendorsTab);

    expect(screen.getByText('Tailored Vendor Procurement Checklist')).toBeInTheDocument();
    expect(screen.getByText('Live Stage Audio')).toBeInTheDocument();
    expect(screen.getByText(/Apex Audio Bengaluru/)).toBeInTheDocument();
  });

  it('switches to recommendations tab and shows savings advice', () => {
    const onUpdateEvent = vi.fn();
    const openBudgetRescue = vi.fn();

    render(
      <AiEventStudio
        event={mockEvent}
        onUpdateEvent={onUpdateEvent}
        openBudgetRescue={openBudgetRescue}
      />
    );

    const recsTab = screen.getByRole('tab', { name: /Smart Recommendations/i });
    fireEvent.click(recsTab);

    expect(screen.getByText('Personalized Recommendations & Alternatives')).toBeInTheDocument();
    expect(screen.getByText('Digital QR badges instead of plastic lanyards')).toBeInTheDocument();
    expect(screen.getByText(/Saves ~INR 8,000/)).toBeInTheDocument();
  });

  it('opens Budget Rescue Mode when clicking Rescue Mode button', () => {
    const onUpdateEvent = vi.fn();
    const openBudgetRescue = vi.fn();

    render(
      <AiEventStudio
        event={mockEvent}
        onUpdateEvent={onUpdateEvent}
        openBudgetRescue={openBudgetRescue}
      />
    );

    const rescueBtn = screen.getByRole('button', { name: /Launch Budget Rescue Mode/i });
    fireEvent.click(rescueBtn);

    expect(openBudgetRescue).toHaveBeenCalledTimes(1);
  });
});
