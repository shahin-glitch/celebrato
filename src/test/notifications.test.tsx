import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { NotificationDrawer } from '../components/notifications/NotificationDrawer';
import type { AppNotification } from '../types';

const mockNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Sound Vendor Agreement Due',
    message: 'Deposit agreement deadline is approaching in 48 hours.',
    timestamp: '2 hours ago',
    read: false,
    type: 'deadline',
    targetTab: 'vendors',
  },
  {
    id: 'notif-2',
    title: 'Catering Headcount Updated',
    message: 'Attending headcount reached 185 guests.',
    timestamp: '5 hours ago',
    read: true,
    type: 'rsvp',
    targetTab: 'guests',
  },
];

describe('NotificationDrawer Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <NotificationDrawer
        isOpen={false}
        onClose={vi.fn()}
        notifications={mockNotifications}
        onMarkRead={vi.fn()}
        onMarkAllRead={vi.fn()}
        onNavigate={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders notification items and unread status when isOpen is true', () => {
    render(
      <NotificationDrawer
        isOpen={true}
        onClose={vi.fn()}
        notifications={mockNotifications}
        onMarkRead={vi.fn()}
        onMarkAllRead={vi.fn()}
        onNavigate={vi.fn()}
      />
    );

    expect(screen.getByText('Notifications & Reminders')).toBeInTheDocument();
    expect(screen.getByText('Sound Vendor Agreement Due')).toBeInTheDocument();
    expect(screen.getByText('Catering Headcount Updated')).toBeInTheDocument();
  });

  it('triggers onMarkAllRead when clicking "Mark all as read"', () => {
    const onMarkAllRead = vi.fn();

    render(
      <NotificationDrawer
        isOpen={true}
        onClose={vi.fn()}
        notifications={mockNotifications}
        onMarkRead={vi.fn()}
        onMarkAllRead={onMarkAllRead}
        onNavigate={vi.fn()}
      />
    );

    const markAllBtn = screen.getByRole('button', { name: /Mark all as read/i });
    fireEvent.click(markAllBtn);

    expect(onMarkAllRead).toHaveBeenCalledTimes(1);
  });

  it('marks single notification read, navigates, and closes when clicked', () => {
    const onMarkRead = vi.fn();
    const onNavigate = vi.fn();
    const onClose = vi.fn();

    render(
      <NotificationDrawer
        isOpen={true}
        onClose={onClose}
        notifications={mockNotifications}
        onMarkRead={onMarkRead}
        onMarkAllRead={vi.fn()}
        onNavigate={onNavigate}
      />
    );

    const item = screen.getByRole('button', { name: /Sound Vendor Agreement Due/i });
    fireEvent.click(item);

    expect(onMarkRead).toHaveBeenCalledWith('notif-1');
    expect(onNavigate).toHaveBeenCalledWith('vendors', undefined);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape key press', () => {
    const onClose = vi.fn();

    render(
      <NotificationDrawer
        isOpen={true}
        onClose={onClose}
        notifications={mockNotifications}
        onMarkRead={vi.fn()}
        onMarkAllRead={vi.fn()}
        onNavigate={vi.fn()}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
