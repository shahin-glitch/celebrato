import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GuestManager } from '../components/guests/GuestManager';
import type { EventPlan, Guest } from '../types';

const mockGuests: Guest[] = [
  {
    id: 'gst-1',
    name: 'Aarav Sharma',
    group: 'VIP Council',
    email: 'aarav@example.com',
    phone: '+91 98765 43210',
    rsvpStatus: 'attending',
    accompanyingGuests: 2, // 1 + 2 = 3 attendees
    dietary: 'Vegetarian',
    tableGroup: 'Table 1',
  },
  {
    id: 'gst-2',
    name: 'Neha Kapoor',
    group: 'Faculty',
    email: 'neha@example.com',
    phone: '+91 98765 43211',
    rsvpStatus: 'attending',
    accompanyingGuests: 0, // 1 + 0 = 1 attendee -> Total attending = 4
    dietary: 'Standard',
    tableGroup: 'Table 2',
  },
  {
    id: 'gst-3',
    name: 'Rohan Verma',
    group: 'Student Rep',
    email: 'rohan@example.com',
    phone: '+91 98765 43212',
    rsvpStatus: 'pending',
    accompanyingGuests: 1, // 1 + 1 = 2 pending
    dietary: 'Nut allergy',
  },
  {
    id: 'gst-4',
    name: 'Pooja Hegde',
    group: 'Alumni',
    rsvpStatus: 'declined',
    accompanyingGuests: 0, // 1 + 0 = 1 declined
  },
];

const mockGuestEvent: EventPlan = {
  id: 'event-guests-1',
  name: 'Alumni Reunion',
  occasion: 'college_fest',
  date: '2026-11-20',
  startTime: '18:00',
  location: 'Campus Lawn',
  venueStatus: 'booked',
  guestCount: 20, // catering capacity
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  budget: {
    currency: 'INR',
    total: 100000,
    categories: [],
  },
  preferences: {
    theme: 'Campus Nostalgia',
    colorPalette: [],
    foodPreferences: [],
    dietaryRequirements: [],
    atmosphere: 'casual',
    indoorOutdoor: 'indoor',
    budgetPriority: 'balanced_value',
    mustHaves: [],
    avoid: [],
  },
  concept: {
    title: 'Concept',
    description: '',
    theme: 'Nostalgia',
    colorPalette: [],
    decorDirection: '',
    suggestedActivities: [],
    menuDirection: '',
    reasoning: '',
    generatedBy: 'deterministic',
  },
  timeline: [],
  vendorChecklist: [],
  recommendations: [],
  guests: mockGuests,
};

describe('Guest RSVP Counts & Management', () => {
  it('accurately computes attending, pending, and declined counts including accompanying attendees', () => {
    const onUpdate = vi.fn();
    render(<GuestManager event={mockGuestEvent} onUpdateEvent={onUpdate} />);

    // Total Confirmed Attending: (1+2) + (1+0) = 4
    expect(screen.getByText('Attending RSVPs')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();

    // Pending: (1+1) = 2
    expect(screen.getByText('Pending Acknowledgment')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    // Declined: 1
    expect(screen.getAllByText('Declined')[0]).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();

    // Capacity: 4 / 20
    expect(screen.getByText('4 / 20')).toBeInTheDocument();
  });

  it('filters guest list by RSVP status buttons', () => {
    const onUpdate = vi.fn();
    render(<GuestManager event={mockGuestEvent} onUpdateEvent={onUpdate} />);

    // Filter by 'attending'
    const attendingTab = screen.getByRole('button', { name: /^attending$/i });
    fireEvent.click(attendingTab);

    expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    expect(screen.getByText('Neha Kapoor')).toBeInTheDocument();
    expect(screen.queryByText('Rohan Verma')).not.toBeInTheDocument();
    expect(screen.queryByText('Pooja Hegde')).not.toBeInTheDocument();

    // Filter by 'declined'
    const declinedTab = screen.getByRole('button', { name: /^declined$/i });
    fireEvent.click(declinedTab);

    expect(screen.queryByText('Aarav Sharma')).not.toBeInTheDocument();
    expect(screen.getByText('Pooja Hegde')).toBeInTheDocument();
  });

  it('filters guest list by search query on name, group, or table', () => {
    const onUpdate = vi.fn();
    render(<GuestManager event={mockGuestEvent} onUpdateEvent={onUpdate} />);

    const searchInput = screen.getByPlaceholderText(/Search by name, group, or table/i);

    // Search by group name "Faculty"
    fireEvent.change(searchInput, { target: { value: 'Faculty' } });
    expect(screen.getByText('Neha Kapoor')).toBeInTheDocument();
    expect(screen.queryByText('Aarav Sharma')).not.toBeInTheDocument();

    // Search by guest name "Rohan"
    fireEvent.change(searchInput, { target: { value: 'Rohan' } });
    expect(screen.getByText('Rohan Verma')).toBeInTheDocument();
    expect(screen.queryByText('Neha Kapoor')).not.toBeInTheDocument();
  });

  it('allows adding a new guest with accompanying party', () => {
    const onUpdate = vi.fn();
    render(<GuestManager event={mockGuestEvent} onUpdateEvent={onUpdate} />);

    // Open Add Guest Modal
    fireEvent.click(screen.getByRole('button', { name: /Add Guest/i }));
    expect(screen.getByText('Add Guest / Group')).toBeInTheDocument();

    // Fill form
    const nameInput = screen.getByPlaceholderText(/e\.g\. Maya Krishnan & Family/i);
    fireEvent.change(nameInput, { target: { value: 'Aditi Rao' } });

    const groupInput = screen.getByPlaceholderText(/e\.g\. VIP Performers/i);
    fireEvent.change(groupInput, { target: { value: 'Sponsors' } });

    // Accompanying guests: find the number input in modal
    const plusInputs = screen.getAllByRole('spinbutton');
    const accompanyingInput = plusInputs[plusInputs.length - 1];
    fireEvent.change(accompanyingInput, { target: { value: '3' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Save Guest/i }));

    expect(onUpdate).toHaveBeenCalledTimes(1);
    const updated = onUpdate.mock.calls[0][0] as EventPlan;
    expect(updated.guests).toHaveLength(5);
    const added = updated.guests[0];
    expect(added.name).toBe('Aditi Rao');
    expect(added.group).toBe('Sponsors');
    expect(added.accompanyingGuests).toBe(3);
    expect(added.rsvpStatus).toBe('attending');
  });

  it('allows updating a guest RSVP status', () => {
    const onUpdate = vi.fn();
    render(<GuestManager event={mockGuestEvent} onUpdateEvent={onUpdate} />);

    // Find the select dropdowns for RSVP status
    const statusSelects = screen.getAllByDisplayValue(/Attending/i);
    // Change first guest's status to 'declined'
    fireEvent.change(statusSelects[0], { target: { value: 'declined' } });

    expect(onUpdate).toHaveBeenCalledTimes(1);
    const updated = onUpdate.mock.calls[0][0] as EventPlan;
    const guest1 = updated.guests.find((g) => g.id === 'gst-1');
    expect(guest1?.rsvpStatus).toBe('declined');
  });

  it('allows deleting a guest', () => {
    const onUpdate = vi.fn();
    render(<GuestManager event={mockGuestEvent} onUpdateEvent={onUpdate} />);

    const deleteButtons = screen.getAllByTitle('Remove Guest');
    fireEvent.click(deleteButtons[0]);

    expect(onUpdate).toHaveBeenCalledTimes(1);
    const updated = onUpdate.mock.calls[0][0] as EventPlan;
    expect(updated.guests).toHaveLength(3);
    expect(updated.guests.find((g) => g.id === 'gst-1')).toBeUndefined();
  });
});
