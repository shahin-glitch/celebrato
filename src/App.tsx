import React, { useState, useEffect, useMemo } from 'react';
import type { EventPlan, AppNotification, CurrencyType } from './types';
import { StorageService } from './services/storage';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { RightPlannerPanel } from './components/layout/RightPlannerPanel';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { AiEventStudio } from './components/aiStudio/AiEventStudio';
import { BudgetPlanner } from './components/budget/BudgetPlanner';
import { BudgetRescueModal } from './components/budget/BudgetRescueModal';
import { TimelineTasks } from './components/timeline/TimelineTasks';
import { VendorDirectory } from './components/vendors/VendorDirectory';
import { GuestManager } from './components/guests/GuestManager';
import { ThemeGallery } from './components/themes/ThemeGallery';
import { MyEventsList } from './components/events/MyEventsList';
import { CreateEventWizard } from './components/events/CreateEventWizard';
import { SettingsModal } from './components/settings/SettingsModal';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { SAMPLE_VENDORS, THEME_GALLERY } from './services/sampleData';
import { X } from 'lucide-react';

export function App() {
  // Persistence state
  const [events, setEvents] = useState<EventPlan[]>(() => StorageService.getEvents());
  const [activeEventId, setActiveEventId] = useState<string>(() =>
    StorageService.getActiveEventId()
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    StorageService.getNotifications()
  );
  const [currency, setCurrency] = useState<CurrencyType>(() =>
    StorageService.getCurrency()
  );

  // Active view state
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isRescueModalOpen, setIsRescueModalOpen] = useState(false);
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Active Event resolution
  const activeEvent = useMemo(() => {
    const match = events.find((e) => e.id === activeEventId);
    if (match) return match;
    return events[0];
  }, [events, activeEventId]);

  // Keep StorageService synced
  useEffect(() => {
    StorageService.saveEvents(events);
  }, [events]);

  useEffect(() => {
    StorageService.setActiveEventId(activeEventId);
  }, [activeEventId]);

  const handleUpdateActiveEvent = (updated: EventPlan) => {
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  };

  const handleSelectEvent = (id: string) => {
    setActiveEventId(id);
    StorageService.setActiveEventId(id);
  };

  const handleDeleteEvent = (id: string) => {
    const remaining = StorageService.deleteEvent(id);
    setEvents(remaining);
    if (remaining.length > 0) {
      setActiveEventId(remaining[0].id);
    }
  };

  const handleResetDemoData = () => {
    StorageService.resetToDemoData();
    const fresh = StorageService.getEvents();
    setEvents(fresh);
    setActiveEventId(fresh[0].id);
    setNotifications(StorageService.getNotifications());
  };

  const handleCurrencyChange = (newCurr: CurrencyType) => {
    setCurrency(newCurr);
    StorageService.setCurrency(newCurr);
    setEvents((prev) =>
      prev.map((e) => ({
        ...e,
        budget: {
          ...e.budget,
          currency: newCurr,
        },
      }))
    );
  };

  const handleToggleTimelineTask = (taskId: string) => {
    if (!activeEvent) return;
    const updatedTimeline = activeEvent.timeline.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    handleUpdateActiveEvent({
      ...activeEvent,
      timeline: updatedTimeline,
    });
  };

  const handleMarkNotificationRead = (id: string) => {
    const updated = StorageService.markNotificationRead(id);
    setNotifications(updated);
  };

  const handleMarkAllNotificationsRead = () => {
    const updated = StorageService.markAllNotificationsRead();
    setNotifications(updated);
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  // Global search filtering
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();

    const matchingEvents = events.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.occasion.toLowerCase().includes(q)
    );

    const matchingTasks = (activeEvent?.timeline || []).filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );

    const matchingVendors = SAMPLE_VENDORS.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q)
    );

    const matchingGuests = (activeEvent?.guests || []).filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.group.toLowerCase().includes(q)
    );

    const matchingThemes = THEME_GALLERY.filter(
      (th) =>
        th.title.toLowerCase().includes(q) ||
        th.description.toLowerCase().includes(q)
    );

    return {
      events: matchingEvents,
      tasks: matchingTasks,
      vendors: matchingVendors,
      guests: matchingGuests,
      themes: matchingThemes,
      total:
        matchingEvents.length +
        matchingTasks.length +
        matchingVendors.length +
        matchingGuests.length +
        matchingThemes.length,
    };
  }, [searchQuery, events, activeEvent]);

  return (
    <div className="min-h-screen bg-[#F0E5FD] p-2 sm:p-4 lg:p-6 flex items-center justify-center relative overflow-hidden select-text">
      {/* Skip to Main Content Link for Keyboard and Screen Reader Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#171717] focus:text-[#C2F2B0] focus:rounded-xl focus:font-mono-code focus:text-xs font-bold neo-shadow-sm focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Neo-Brutalist Outer Pastel Geometry (Reference Background) */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#FFC29E]/30 blur-2xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#62C5F3]/25 blur-2xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-[#F4BCE8]/20 blur-xl pointer-events-none"></div>

      {/* Floating Application Canvas Frame matching reference design */}
      <div className="w-full max-w-[1520px] min-h-[92vh] bg-white rounded-[28px] neo-border shadow-[0_25px_60px_-15px_rgba(0,0,0,0.14)] overflow-hidden flex flex-col lg:flex-row relative z-10">
        {/* Left Mint Green Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setSearchQuery('');
          }}
          openCreateWizard={() => setIsCreateWizardOpen(true)}
          openSettings={() => setIsSettingsOpen(true)}
        />

        {/* Central Main Workspace */}
        <main id="main-content" tabIndex={-1} className="flex-1 bg-white p-5 sm:p-7 lg:p-8 flex flex-col overflow-y-auto outline-none">
          {/* Top Header Bar */}
          <TopHeader
            events={events}
            activeEvent={activeEvent}
            onSelectEvent={handleSelectEvent}
            openCreateWizard={() => setIsCreateWizardOpen(true)}
            openBudgetRescue={() => setIsRescueModalOpen(true)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* Global Search Results Overlay */}
          {searchResults && (
            <div className="my-4 p-5 bg-[#FCFBF7] rounded-2xl neo-border neo-shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono-code text-xs font-bold text-[#171717]">
                  Search Results for "{searchQuery}" ({searchResults.total} found)
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear Search"
                  className="text-xs font-mono-code text-[#565656] hover:text-black flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Clear Search
                </button>
              </div>

              {searchResults.total === 0 ? (
                <p className="text-xs text-[#565656]">No matches found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {searchResults.events.length > 0 && (
                    <div className="p-3 bg-white rounded-xl neo-border">
                      <span className="font-bold font-mono-code text-[#171717] block mb-2">
                        Celebrations ({searchResults.events.length})
                      </span>
                      {searchResults.events.map((e) => (
                        <div
                          key={e.id}
                          onClick={() => {
                            handleSelectEvent(e.id);
                            setActiveTab('overview');
                            setSearchQuery('');
                          }}
                          className="py-1 cursor-pointer hover:underline text-indigo-700"
                        >
                          {e.name} • {e.location}
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.tasks.length > 0 && (
                    <div className="p-3 bg-white rounded-xl neo-border">
                      <span className="font-bold font-mono-code text-[#171717] block mb-2">
                        Milestone Tasks ({searchResults.tasks.length})
                      </span>
                      {searchResults.tasks.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => {
                            setActiveTab('timeline');
                            setSearchQuery('');
                          }}
                          className="py-1 cursor-pointer hover:underline text-emerald-800"
                        >
                          {t.title} ({t.dueDate})
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.vendors.length > 0 && (
                    <div className="p-3 bg-white rounded-xl neo-border">
                      <span className="font-bold font-mono-code text-[#171717] block mb-2">
                        Vendors ({searchResults.vendors.length})
                      </span>
                      {searchResults.vendors.map((v) => (
                        <div
                          key={v.id}
                          onClick={() => {
                            setActiveTab('vendors');
                            setSearchQuery('');
                          }}
                          className="py-1 cursor-pointer hover:underline text-amber-800"
                        >
                          {v.name} • {v.category} ({v.location})
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.guests.length > 0 && (
                    <div className="p-3 bg-white rounded-xl neo-border">
                      <span className="font-bold font-mono-code text-[#171717] block mb-2">
                        Guests ({searchResults.guests.length})
                      </span>
                      {searchResults.guests.map((g) => (
                        <div
                          key={g.id}
                          onClick={() => {
                            setActiveTab('guests');
                            setSearchQuery('');
                          }}
                          className="py-1 cursor-pointer hover:underline text-purple-800"
                        >
                          {g.name} ({g.group})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Active Tab Router */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <OverviewDashboard
                event={activeEvent}
                setActiveTab={setActiveTab}
                openBudgetRescue={() => setIsRescueModalOpen(true)}
              />
            )}

            {activeTab === 'studio' && (
              <AiEventStudio
                event={activeEvent}
                onUpdateEvent={handleUpdateActiveEvent}
                openBudgetRescue={() => setIsRescueModalOpen(true)}
              />
            )}

            {activeTab === 'budget' && (
              <BudgetPlanner
                event={activeEvent}
                onUpdateEvent={handleUpdateActiveEvent}
                openBudgetRescue={() => setIsRescueModalOpen(true)}
              />
            )}

            {activeTab === 'timeline' && (
              <TimelineTasks
                event={activeEvent}
                onUpdateEvent={handleUpdateActiveEvent}
              />
            )}

            {activeTab === 'vendors' && (
              <VendorDirectory
                event={activeEvent}
                onUpdateEvent={handleUpdateActiveEvent}
              />
            )}

            {activeTab === 'guests' && (
              <GuestManager
                event={activeEvent}
                onUpdateEvent={handleUpdateActiveEvent}
              />
            )}

            {activeTab === 'themes' && (
              <ThemeGallery
                event={activeEvent}
                onUpdateEvent={handleUpdateActiveEvent}
              />
            )}

            {activeTab === 'events' && (
              <MyEventsList
                events={events}
                activeEventId={activeEventId}
                onSelectEvent={(id) => {
                  handleSelectEvent(id);
                  setActiveTab('overview');
                }}
                onDeleteEvent={handleDeleteEvent}
                openCreateWizard={() => setIsCreateWizardOpen(true)}
                onResetDemoData={handleResetDemoData}
              />
            )}
          </div>
        </main>

        {/* Right Lemon-Mint Planner Panel matching reference layout */}
        <RightPlannerPanel
          event={activeEvent}
          onToggleTask={handleToggleTimelineTask}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          unreadNotificationsCount={unreadNotifsCount}
        />
      </div>

      {/* Signature Budget Rescue Mode Modal */}
      <BudgetRescueModal
        isOpen={isRescueModalOpen}
        onClose={() => setIsRescueModalOpen(false)}
        event={activeEvent}
        onApplyRescuedPlan={handleUpdateActiveEvent}
      />

      {/* Create Event Guided Wizard */}
      <CreateEventWizard
        isOpen={isCreateWizardOpen}
        onClose={() => setIsCreateWizardOpen(false)}
        onEventCreated={(newEv) => {
          setEvents((prev) => [newEv, ...prev]);
          setActiveEventId(newEv.id);
          setActiveTab('studio');
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        onResetDemo={handleResetDemoData}
      />

      {/* In-App Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onNavigate={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}

export default App;
