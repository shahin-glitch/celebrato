import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ThemeGallery } from '../components/themes/ThemeGallery';
import type { EventPlan } from '../types';

const mockEvent: EventPlan = {
  id: 'test-theme-event',
  name: 'Celebration of Milestones',
  occasion: 'birthday',
  date: '2026-11-20',
  startTime: '19:00',
  location: 'Bengaluru',
  venueStatus: 'booked',
  guestCount: 80,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  budget: {
    currency: 'INR',
    total: 80000,
    categories: [],
  },
  preferences: {
    theme: 'Electric Sunset Carnival',
    colorPalette: ['#FF6B6B'],
    foodPreferences: [],
    dietaryRequirements: [],
    atmosphere: 'casual',
    indoorOutdoor: 'indoor',
    budgetPriority: 'balanced_value',
    mustHaves: [],
    avoid: [],
  },
  concept: {
    title: 'Milestone Celebration',
    description: '',
    theme: 'Electric Sunset Carnival',
    colorPalette: ['#FF6B6B'],
    decorDirection: 'Original decor',
    suggestedActivities: [],
    menuDirection: '',
    reasoning: '',
    generatedBy: 'deterministic',
  },
  timeline: [],
  vendorChecklist: [],
  recommendations: [],
  guests: [],
};

describe('ThemeGallery Component', () => {
  it('renders theme inspirations and displays active theme label', () => {
    const onUpdateEvent = vi.fn();

    render(<ThemeGallery event={mockEvent} onUpdateEvent={onUpdateEvent} />);

    expect(screen.getByText('Theme & Inspiration Studio')).toBeInTheDocument();
    expect(screen.getAllByText('Electric Sunset Carnival')[0]).toBeInTheDocument();
    expect(screen.getByText('Theme Applied')).toBeInTheDocument();
  });

  it('allows applying an alternative theme to event', () => {
    const onUpdateEvent = vi.fn();

    render(<ThemeGallery event={mockEvent} onUpdateEvent={onUpdateEvent} />);

    // Apply "Golden Jubilee Noir" or another theme
    const applyButtons = screen.getAllByRole('button', { name: /Apply theme/i });
    expect(applyButtons.length).toBeGreaterThan(0);

    fireEvent.click(applyButtons[0]);

    expect(onUpdateEvent).toHaveBeenCalledTimes(1);
    const updated = onUpdateEvent.mock.calls[0][0] as EventPlan;
    expect(updated.concept.theme).not.toBe('');
    expect(updated.concept.colorPalette.length).toBeGreaterThan(0);
  });
});
