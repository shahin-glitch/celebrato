import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageService } from '../services/storage';
import { INITIAL_EVENTS, INITIAL_NOTIFICATIONS } from '../services/sampleData';
import type { EventPlan } from '../types';

describe('Persistent Storage Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default initial events when localStorage is empty', () => {
    const events = StorageService.getEvents();
    expect(events).toEqual(INITIAL_EVENTS);
    expect(events.length).toBeGreaterThan(0);

    // Verify it saved the fallback to localStorage
    const stored = localStorage.getItem('celebrato_events_v1');
    expect(stored).not.toBeNull();
  });

  it('handles corrupted or invalid JSON in localStorage gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem('celebrato_events_v1', 'INVALID_JSON{{{');
    const events = StorageService.getEvents();
    expect(events).toEqual(INITIAL_EVENTS);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('handles empty array in localStorage by restoring initial events', () => {
    localStorage.setItem('celebrato_events_v1', JSON.stringify([]));
    const events = StorageService.getEvents();
    expect(events).toEqual(INITIAL_EVENTS);
  });

  it('saves and retrieves customized events accurately', () => {
    const customEvents: EventPlan[] = [
      {
        ...INITIAL_EVENTS[0],
        id: 'custom-event-1',
        name: 'Custom Annual Summit',
      },
    ];

    StorageService.saveEvents(customEvents);
    const retrieved = StorageService.getEvents();
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].id).toBe('custom-event-1');
    expect(retrieved[0].name).toBe('Custom Annual Summit');
  });

  it('manages active event ID and falls back to first event ID', () => {
    // When no active id is stored
    const activeId = StorageService.getActiveEventId();
    expect(activeId).toBe(INITIAL_EVENTS[0].id);

    // When setting active event ID
    StorageService.setActiveEventId('custom-event-2');
    expect(StorageService.getActiveEventId()).toBe('custom-event-2');
  });

  it('retrieves active event, falling back to first event if ID does not match', () => {
    StorageService.setActiveEventId('non-existent-id');
    const activeEvent = StorageService.getActiveEvent();
    expect(activeEvent.id).toBe(INITIAL_EVENTS[0].id);
  });

  it('saves a single event: updates existing event and stamps updatedAt', () => {
    const events = StorageService.getEvents();
    const target = { ...events[0], name: 'Updated Event Name' };

    StorageService.saveEvent(target);

    const reloaded = StorageService.getEvents();
    const updated = reloaded.find((e) => e.id === target.id);
    expect(updated?.name).toBe('Updated Event Name');
    expect(updated?.updatedAt).toBeDefined();
    expect(StorageService.getActiveEventId()).toBe(target.id);
  });

  it('saves a single event: prepends brand new event and sets it active', () => {
    const newEvent: EventPlan = {
      ...INITIAL_EVENTS[0],
      id: 'brand-new-event',
      name: 'Brand New Festival',
    };

    StorageService.saveEvent(newEvent);

    const reloaded = StorageService.getEvents();
    expect(reloaded[0].id).toBe('brand-new-event');
    expect(StorageService.getActiveEventId()).toBe('brand-new-event');
  });

  it('deletes an event and updates active ID if deleted event was active', () => {
    const events = StorageService.getEvents();
    const idToDelete = events[0].id;
    const nextExpectedId = events[1].id;

    StorageService.setActiveEventId(idToDelete);
    const remaining = StorageService.deleteEvent(idToDelete);

    expect(remaining.find((e) => e.id === idToDelete)).toBeUndefined();
    expect(StorageService.getActiveEventId()).toBe(nextExpectedId);
  });

  it('resets all data back to demo initial state', () => {
    StorageService.saveEvents([]);
    StorageService.setActiveEventId('custom-id');

    StorageService.resetToDemoData();

    expect(StorageService.getEvents()).toEqual(INITIAL_EVENTS);
    expect(StorageService.getActiveEventId()).toBe(INITIAL_EVENTS[0].id);
    expect(StorageService.getNotifications()).toEqual(INITIAL_NOTIFICATIONS);
  });

  it('persists and retrieves currency settings', () => {
    expect(StorageService.getCurrency()).toBe('INR');
    StorageService.setCurrency('USD');
    expect(StorageService.getCurrency()).toBe('USD');
  });

  it('persists and retrieves API key', () => {
    expect(StorageService.getApiKey()).toBe('');
    StorageService.setApiKey('mock-gemini-key-12345');
    expect(StorageService.getApiKey()).toBe('mock-gemini-key-12345');
  });

  it('manages notifications and marks them as read', () => {
    const notifs = StorageService.getNotifications();
    expect(notifs.length).toBeGreaterThan(0);

    const firstId = notifs[0].id;
    const updated = StorageService.markNotificationRead(firstId);
    expect(updated.find((n) => n.id === firstId)?.read).toBe(true);

    const allRead = StorageService.markAllNotificationsRead();
    allRead.forEach((n) => expect(n.read).toBe(true));
  });
});
