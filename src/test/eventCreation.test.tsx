import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateEventWizard } from '../components/events/CreateEventWizard';
import { AIGeneratorService } from '../services/aiGenerator';
import type { EventPlan } from '../types';

describe('Event Creation Wizard & Form Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders step 1 with occasion choices when opened', () => {
    const onClose = vi.fn();
    const onEventCreated = vi.fn();

    render(
      <CreateEventWizard
        isOpen={true}
        onClose={onClose}
        onEventCreated={onEventCreated}
      />
    );

    expect(screen.getByText('Create Celebration Blueprint')).toBeInTheDocument();
    expect(screen.getByText('What occasion are we celebrating?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /College Fest/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Wedding/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Birthday/i })).toBeInTheDocument();
  });

  it('allows selecting an occasion and progressing through wizard steps', async () => {
    const onClose = vi.fn();
    const onEventCreated = vi.fn();

    render(
      <CreateEventWizard
        isOpen={true}
        onClose={onClose}
        onEventCreated={onEventCreated}
      />
    );

    // Step 1: Select Wedding
    const weddingBtn = screen.getByRole('button', { name: /Wedding/i });
    fireEvent.click(weddingBtn);

    // Continue to Step 2
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 2: Name, Date & Location
    expect(screen.getByText('Name, Date & Location')).toBeInTheDocument();
    const titleInput = screen.getByDisplayValue('Campus Cultural Night 2026');
    fireEvent.change(titleInput, { target: { value: 'Priya & Rahul Wedding' } });

    const locationInput = screen.getByDisplayValue('Mangalore, Karnataka');
    fireEvent.change(locationInput, { target: { value: 'Udaipur, Rajasthan' } });

    // Continue to Step 3
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 3: Audience & Atmosphere
    expect(screen.getByText('Audience & Atmosphere')).toBeInTheDocument();
    const guestInput = screen.getByDisplayValue('250');
    fireEvent.change(guestInput, { target: { value: '400' } });

    // Continue to Step 4
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 4: Budget & Priority
    expect(screen.getByText('Budget & Priorities')).toBeInTheDocument();
    const budgetInput = screen.getByDisplayValue('100000');
    fireEvent.change(budgetInput, { target: { value: '500000' } });

    // Continue to Step 5
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 5: Personalization
    expect(screen.getByText('Personalization & Highlights')).toBeInTheDocument();

    // Continue to Step 6
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    // Step 6: Review
    expect(screen.getByText('Ready to Generate Blueprint')).toBeInTheDocument();
    expect(screen.getByText('Priya & Rahul Wedding')).toBeInTheDocument();
    expect(screen.getByText(/400 people/i)).toBeInTheDocument();
    expect(screen.getByText(/(500,000|5,00,000)/)).toBeInTheDocument();
  });

  it('allows navigating back to previous steps without losing state', () => {
    const onClose = vi.fn();
    const onEventCreated = vi.fn();

    render(
      <CreateEventWizard
        isOpen={true}
        onClose={onClose}
        onEventCreated={onEventCreated}
      />
    );

    // Go to step 2
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    expect(screen.getByText('Name, Date & Location')).toBeInTheDocument();

    // Click Back
    const backBtn = screen.getByRole('button', { name: /Back/i });
    fireEvent.click(backBtn);

    // Back on step 1
    expect(screen.getByText('What occasion are we celebrating?')).toBeInTheDocument();
  });

  it('generates event plan and calls onEventCreated on final step', async () => {
    const onClose = vi.fn();
    const onEventCreated = vi.fn();

    const mockAiResponse = {
      concept: {
        title: 'Royalty Unleashed',
        description: 'Luxury wedding celebration',
        theme: 'Royal Heritage',
        colorPalette: ['#800020', '#D4AF37', '#FFFDD0'],
        decorDirection: 'Traditional palace floral',
        suggestedActivities: ['Sangeet', 'Pheras'],
        menuDirection: 'Royal Rajasthani Thali',
        reasoning: 'Tailored for 300 guests',
        generatedBy: 'deterministic' as const,
      },
      categories: [
        {
          id: 'cat-1',
          name: 'Palace Venue',
          amount: 150000,
          percentage: 50,
          reason: 'Venue fee',
          priority: 'high' as const,
          isProtected: true,
        },
        {
          id: 'cat-2',
          name: 'Royal Feast Catering',
          amount: 150000,
          percentage: 50,
          reason: 'Multi-course dinner',
          priority: 'high' as const,
          isProtected: true,
        },
      ],
      timeline: [
        {
          id: 'task-1',
          title: 'Reserve Palace',
          dueDate: '2026-11-01',
          timeSlot: '10:00 AM',
          priority: 'high' as const,
          category: 'Venue',
          completed: false,
        },
      ],
      vendorChecklist: [],
      recommendations: [],
      source: 'deterministic' as const,
    };

    const spyGenerate = vi
      .spyOn(AIGeneratorService, 'generateEventPlan')
      .mockResolvedValueOnce(mockAiResponse);

    render(
      <CreateEventWizard
        isOpen={true}
        onClose={onClose}
        onEventCreated={onEventCreated}
      />
    );

    // Navigate to step 6 directly
    for (let i = 1; i <= 5; i++) {
      fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    }

    const generateBtn = screen.getByRole('button', { name: /Generate AI Plan/i });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(spyGenerate).toHaveBeenCalledTimes(1);
      expect(onEventCreated).toHaveBeenCalledTimes(1);
    });

    const createdEvent: EventPlan = onEventCreated.mock.calls[0][0];
    expect(createdEvent.id).toMatch(/^event-\d+/);
    expect(createdEvent.budget.total).toBe(100000);
    expect(createdEvent.budget.categories).toHaveLength(2);
    expect(createdEvent.guests).toHaveLength(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
