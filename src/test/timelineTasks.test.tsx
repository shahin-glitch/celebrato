import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimelineTasks } from '../components/timeline/TimelineTasks';
import type { EventPlan, TimelineTask } from '../types';

const mockTasks: TimelineTask[] = [
  {
    id: 'task-1',
    title: 'Lock in venue booking & sign deposit agreement',
    dueDate: '2026-10-20',
    timeSlot: '11:00 AM',
    priority: 'high',
    category: 'Venue',
    completed: true,
    notes: 'Confirmed',
  },
  {
    id: 'task-2',
    title: 'Dispatch invitations to 250 guests',
    dueDate: '2026-10-29',
    timeSlot: '02:00 PM',
    priority: 'high',
    category: 'Invitations',
    completed: false,
    notes: 'In progress',
  },
  {
    id: 'task-3',
    title: 'Catering menu tasting & final headcount confirmation',
    dueDate: '2026-11-08',
    timeSlot: '01:30 PM',
    priority: 'medium',
    category: 'Catering',
    completed: false,
    notes: 'Vegetarian tasting',
  },
];

const mockEvent: EventPlan = {
  id: 'event-timeline-1',
  name: 'Celebration 2026',
  occasion: 'college_fest',
  date: '2026-11-20',
  startTime: '18:00',
  location: 'Hall A',
  venueStatus: 'booked',
  guestCount: 250,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  budget: {
    currency: 'INR',
    total: 100000,
    categories: [],
  },
  preferences: {
    theme: 'Electric',
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
    theme: 'Electric',
    colorPalette: [],
    decorDirection: '',
    suggestedActivities: [],
    menuDirection: '',
    reasoning: '',
    generatedBy: 'deterministic',
  },
  timeline: mockTasks,
  vendorChecklist: [],
  recommendations: [],
  guests: [],
};

describe('Timeline & Task Completion Logic', () => {
  it('renders all tasks with accurate completed and pending counts in filter buttons', () => {
    const onUpdate = vi.fn();
    render(<TimelineTasks event={mockEvent} onUpdateEvent={onUpdate} />);

    // Filter buttons should display counts
    expect(screen.getByRole('button', { name: /all \(3\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pending \(2\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /completed \(1\)/i })).toBeInTheDocument();
  });

  it('filters tasks when clicking status filter buttons', () => {
    const onUpdate = vi.fn();
    render(<TimelineTasks event={mockEvent} onUpdateEvent={onUpdate} />);

    // Click 'completed' filter
    fireEvent.click(screen.getByRole('button', { name: /completed \(1\)/i }));

    // Task 1 should be visible, task 2 and 3 should not be
    expect(screen.getByText('Lock in venue booking & sign deposit agreement')).toBeInTheDocument();
    expect(screen.queryByText('Dispatch invitations to 250 guests')).not.toBeInTheDocument();
    expect(screen.queryByText('Catering menu tasting & final headcount confirmation')).not.toBeInTheDocument();

    // Click 'pending' filter
    fireEvent.click(screen.getByRole('button', { name: /pending \(2\)/i }));

    expect(screen.queryByText('Lock in venue booking & sign deposit agreement')).not.toBeInTheDocument();
    expect(screen.getByText('Dispatch invitations to 250 guests')).toBeInTheDocument();
    expect(screen.getByText('Catering menu tasting & final headcount confirmation')).toBeInTheDocument();
  });

  it('toggles task completion status when clicking task toggle button', () => {
    const onUpdate = vi.fn();
    render(<TimelineTasks event={mockEvent} onUpdateEvent={onUpdate} />);

    // Click on pending task
    const task2Title = screen.getByText('Dispatch invitations to 250 guests');
    fireEvent.click(task2Title);

    expect(onUpdate).toHaveBeenCalledTimes(1);
    const updated = onUpdate.mock.calls[0][0] as EventPlan;
    const task2 = updated.timeline.find((t) => t.id === 'task-2');
    expect(task2?.completed).toBe(true);
  });

  it('allows adding a new custom milestone task', () => {
    const onUpdate = vi.fn();
    render(<TimelineTasks event={mockEvent} onUpdateEvent={onUpdate} />);

    // Click Add Custom Task button
    fireEvent.click(screen.getByRole('button', { name: /Add Custom Task/i }));

    // Modal appears
    expect(screen.getByText('Add Custom Milestone Task')).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText(/e\.g\. Confirm acoustic sound-check schedule/i);
    fireEvent.change(titleInput, { target: { value: 'Test Audio Soundcheck' } });

    const submitBtn = screen.getByRole('button', { name: /Save Task/i });
    fireEvent.click(submitBtn);

    expect(onUpdate).toHaveBeenCalledTimes(1);
    const updated = onUpdate.mock.calls[0][0] as EventPlan;
    expect(updated.timeline).toHaveLength(4);
    const addedTask = updated.timeline[3];
    expect(addedTask.title).toBe('Test Audio Soundcheck');
    expect(addedTask.completed).toBe(false);
  });

  it('allows deleting a milestone task', () => {
    const onUpdate = vi.fn();
    render(<TimelineTasks event={mockEvent} onUpdateEvent={onUpdate} />);

    const deleteButtons = screen.getAllByTitle('Delete Task');
    fireEvent.click(deleteButtons[0]);

    expect(onUpdate).toHaveBeenCalledTimes(1);
    const updated = onUpdate.mock.calls[0][0] as EventPlan;
    expect(updated.timeline).toHaveLength(2);
    expect(updated.timeline.find((t) => t.id === 'task-1')).toBeUndefined();
  });
});
