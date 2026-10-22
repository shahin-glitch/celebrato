import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TopHeader } from '../components/layout/TopHeader';
import { Sidebar } from '../components/layout/Sidebar';
import { INITIAL_EVENTS } from '../services/sampleData';

describe('Accessibility Standards Validation', () => {
  it('TopHeader provides accessible names for search and action buttons', () => {
    render(
      <TopHeader
        events={INITIAL_EVENTS}
        activeEvent={INITIAL_EVENTS[0]}
        onSelectEvent={() => {}}
        openCreateWizard={() => {}}
        openBudgetRescue={() => {}}
        searchQuery=""
        setSearchQuery={() => {}}
      />
    );

    expect(screen.getByLabelText(/Search events, tasks, vendors, and guests/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Select active celebration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Activate Budget Rescue Mode/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Create New Event/i)).toBeInTheDocument();
  });

  it('Sidebar navigation contains semantic nav landmark with accessible button names', () => {
    render(
      <Sidebar
        activeTab="overview"
        setActiveTab={() => {}}
        openCreateWizard={() => {}}
      />
    );

    const nav = screen.getByRole('navigation', { name: /Main Navigation/i });
    expect(nav).toBeInTheDocument();

    const homeButton = screen.getByLabelText(/Celebrato Home/i);
    expect(homeButton).toBeInTheDocument();

    const dashboardBtn = screen.getByLabelText('Dashboard');
    expect(dashboardBtn).toHaveAttribute('aria-current', 'page');

    const studioBtn = screen.getByLabelText('AI Event Studio');
    expect(studioBtn).not.toHaveAttribute('aria-current');
  });
});
