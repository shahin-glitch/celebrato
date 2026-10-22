import { useState, useCallback } from 'react';
import type { EventPlan } from '../types';
import { StorageService } from '../services/storage';

export interface UseEventPlanResult {
  events: EventPlan[];
  activeEvent: EventPlan | null;
  activeEventId: string;
  setActiveEventId: (id: string) => void;
  updateEvent: (updatedEvent: EventPlan) => void;
  createEvent: (newEvent: EventPlan) => void;
  resetDemoEvents: () => void;
}

/**
 * Custom React hook encapsulating Event Plan state management and LocalStorage synchronization.
 * Guarantees reactive updates and state persistence across page refreshes.
 */
export function useEventPlan(): UseEventPlanResult {
  const [events, setEvents] = useState<EventPlan[]>(() => StorageService.getEvents());
  const [activeEventId, setActiveEventId] = useState<string>(() => {
    const loaded = StorageService.getEvents();
    return loaded.length > 0 ? loaded[0].id : '';
  });

  const activeEvent = events.find((e) => e.id === activeEventId) || events[0] || null;

  const updateEvent = useCallback((updatedEvent: EventPlan) => {
    setEvents((prev) => {
      const next = prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e));
      StorageService.saveEvents(next);
      return next;
    });
  }, []);

  const createEvent = useCallback((newEvent: EventPlan) => {
    setEvents((prev) => {
      const next = [newEvent, ...prev];
      StorageService.saveEvents(next);
      return next;
    });
    setActiveEventId(newEvent.id);
  }, []);

  const resetDemoEvents = useCallback(() => {
    StorageService.resetToDemoData();
    const fresh = StorageService.getEvents();
    setEvents(fresh);
    if (fresh.length > 0) {
      setActiveEventId(fresh[0].id);
    }
  }, []);

  return {
    events,
    activeEvent,
    activeEventId,
    setActiveEventId,
    updateEvent,
    createEvent,
    resetDemoEvents,
  };
}
