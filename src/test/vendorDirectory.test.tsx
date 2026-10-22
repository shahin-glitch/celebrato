import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VendorDirectory } from '../components/vendors/VendorDirectory';
import type { EventPlan } from '../types';

const mockEvent: EventPlan = {
  id: 'test-vendor-event',
  name: 'Annual Heritage Gala',
  occasion: 'wedding',
  date: '2026-12-10',
  startTime: '16:00',
  location: 'Udaipur',
  venueStatus: 'booked',
  guestCount: 250,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  budget: {
    currency: 'INR',
    total: 500000,
    categories: [],
  },
  preferences: {
    theme: 'Royal Palace',
    colorPalette: ['#D4AF37'],
    foodPreferences: [],
    dietaryRequirements: [],
    atmosphere: 'formal',
    indoorOutdoor: 'outdoor',
    budgetPriority: 'premium_experience',
    mustHaves: [],
    avoid: [],
  },
  concept: {
    title: 'Heritage Blueprint',
    description: '',
    theme: 'Royal',
    colorPalette: [],
    decorDirection: '',
    suggestedActivities: [],
    menuDirection: '',
    reasoning: '',
    generatedBy: 'deterministic',
  },
  timeline: [],
  vendorChecklist: [
    {
      id: 'vc-initial',
      category: 'Sound & Audio',
      reason: 'Lawn acoustic coverage',
      estimatedMin: 20000,
      estimatedMax: 35000,
      bookingDeadline: '2026-11-20',
      questions: ['Can you provide sound proofing?'],
      status: 'shortlisted',
      assignedVendorName: 'Coastal Beats Audio & Lighting',
      contactInfo: 'coastalbeats@audio.in',
    },
  ],
  recommendations: [],
  guests: [],
};

describe('VendorDirectory Component', () => {
  it('renders directory tab with vendor partners by default', () => {
    const onUpdateEvent = vi.fn();

    render(<VendorDirectory event={mockEvent} onUpdateEvent={onUpdateEvent} />);

    expect(screen.getByText('Vendor Discovery & Checklist')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search vendor name, category, or city/i)).toBeInTheDocument();
  });

  it('filters vendors by text search query', () => {
    const onUpdateEvent = vi.fn();

    render(<VendorDirectory event={mockEvent} onUpdateEvent={onUpdateEvent} />);

    const searchInput = screen.getByLabelText(/Search vendor name, category, or city/i);
    fireEvent.change(searchInput, { target: { value: 'Swad' } });

    expect(screen.getByText(/Swad Fast-Track Caterers/i)).toBeInTheDocument();
  });

  it('filters vendors by category dropdown', () => {
    const onUpdateEvent = vi.fn();

    render(<VendorDirectory event={mockEvent} onUpdateEvent={onUpdateEvent} />);

    const catSelect = screen.getByLabelText(/Filter vendors by category/i);
    fireEvent.change(catSelect, { target: { value: 'Catering' } });

    expect(screen.getByText(/Swad Fast-Track Caterers/i)).toBeInTheDocument();
  });

  it('adds vendor to event checklist and switches to saved tab', () => {
    const onUpdateEvent = vi.fn();

    render(<VendorDirectory event={mockEvent} onUpdateEvent={onUpdateEvent} />);

    const searchInput = screen.getByLabelText(/Search vendor name, category, or city/i);
    fireEvent.change(searchInput, { target: { value: 'Swad' } });

    const addBtn = screen.getByRole('button', { name: /Add Swad Fast-Track Caterers to event/i });
    fireEvent.click(addBtn);

    expect(onUpdateEvent).toHaveBeenCalledTimes(1);
    const updated = onUpdateEvent.mock.calls[0][0] as EventPlan;
    expect(updated.vendorChecklist).toHaveLength(2);
    expect(
      updated.vendorChecklist.some((vc) => vc.assignedVendorName === 'Swad Fast-Track Caterers')
    ).toBe(true);

    // Switches tab to saved view
    expect(screen.getByText('Saved to Event (1)')).toBeInTheDocument();
  });

  it('switches to saved tab and updates checklist item status', () => {
    const onUpdateEvent = vi.fn();

    render(<VendorDirectory event={mockEvent} onUpdateEvent={onUpdateEvent} />);

    const savedTabBtn = screen.getByRole('button', { name: /Saved to Event/i });
    fireEvent.click(savedTabBtn);

    expect(screen.getByText('Coastal Beats Audio & Lighting')).toBeInTheDocument();

    const statusSelect = screen.getByLabelText(/Status for Sound & Audio/i);
    fireEvent.change(statusSelect, { target: { value: 'booked' } });

    expect(onUpdateEvent).toHaveBeenCalledTimes(1);
    const updated = onUpdateEvent.mock.calls[0][0] as EventPlan;
    expect(updated.vendorChecklist[0].status).toBe('booked');
  });
});
