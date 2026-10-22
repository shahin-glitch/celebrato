import type { EventPlan, AppNotification, CurrencyType } from '../types';
import { INITIAL_EVENTS, INITIAL_NOTIFICATIONS } from './sampleData';

const STORAGE_KEYS = {
  EVENTS: 'celebrato_events_v1',
  ACTIVE_EVENT_ID: 'celebrato_active_event_id_v1',
  NOTIFICATIONS: 'celebrato_notifications_v1',
  GEMINI_API_KEY: 'celebrato_gemini_api_key_v1',
  CURRENCY: 'celebrato_currency_v1',
  USER_PROFILE: 'celebrato_user_profile_v1',
};

export const StorageService = {
  getEvents(): EventPlan[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (!data) {
        this.saveEvents(INITIAL_EVENTS);
        return INITIAL_EVENTS;
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.saveEvents(INITIAL_EVENTS);
        return INITIAL_EVENTS;
      }
      return parsed;
    } catch (e) {
      console.error('Error loading events from localStorage:', e);
      return INITIAL_EVENTS;
    }
  },

  saveEvents(events: EventPlan[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch (e) {
      console.error('Error saving events to localStorage:', e);
    }
  },

  getActiveEventId(): string {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_EVENT_ID);
    if (stored) return stored;
    const events = this.getEvents();
    const firstId = events[0]?.id || 'event-campus-fest-2026';
    this.setActiveEventId(firstId);
    return firstId;
  },

  setActiveEventId(id: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT_ID, id);
    } catch (e) {
      console.error('Error setting active event ID:', e);
    }
  },

  getActiveEvent(): EventPlan {
    const events = this.getEvents();
    const activeId = this.getActiveEventId();
    const match = events.find((e) => e.id === activeId);
    if (match) return match;
    if (events.length > 0) {
      this.setActiveEventId(events[0].id);
      return events[0];
    }
    this.saveEvents(INITIAL_EVENTS);
    return INITIAL_EVENTS[0];
  },

  saveEvent(updatedEvent: EventPlan): void {
    const events = this.getEvents();
    const index = events.findIndex((e) => e.id === updatedEvent.id);
    const stamped = {
      ...updatedEvent,
      updatedAt: new Date().toISOString(),
    };
    if (index >= 0) {
      events[index] = stamped;
    } else {
      events.unshift(stamped);
    }
    this.saveEvents(events);
    this.setActiveEventId(updatedEvent.id);
  },

  deleteEvent(id: string): EventPlan[] {
    const events = this.getEvents().filter((e) => e.id !== id);
    this.saveEvents(events);
    if (this.getActiveEventId() === id) {
      const nextId = events[0]?.id || '';
      if (nextId) this.setActiveEventId(nextId);
    }
    return events;
  },

  resetToDemoData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.EVENTS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_EVENT_ID);
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
      this.saveEvents(INITIAL_EVENTS);
      this.setActiveEventId(INITIAL_EVENTS[0].id);
      this.saveNotifications(INITIAL_NOTIFICATIONS);
    } catch (e) {
      console.error('Error resetting demo data:', e);
    }
  },

  getNotifications(): AppNotification[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (!data) {
        this.saveNotifications(INITIAL_NOTIFICATIONS);
        return INITIAL_NOTIFICATIONS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },

  saveNotifications(notifs: AppNotification[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    } catch (e) {
      console.error('Error saving notifications:', e);
    }
  },

  markNotificationRead(id: string): AppNotification[] {
    const notifs = this.getNotifications().map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    this.saveNotifications(notifs);
    return notifs;
  },

  markAllNotificationsRead(): AppNotification[] {
    const notifs = this.getNotifications().map((n) => ({ ...n, read: true }));
    this.saveNotifications(notifs);
    return notifs;
  },

  getApiKey(): string {
    return (
      localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY) ||
      import.meta.env.VITE_GEMINI_API_KEY ||
      ''
    );
  },

  setApiKey(key: string): void {
    localStorage.setItem(STORAGE_KEYS.GEMINI_API_KEY, key.trim());
  },

  getCurrency(): CurrencyType {
    return (localStorage.getItem(STORAGE_KEYS.CURRENCY) as CurrencyType) || 'INR';
  },

  setCurrency(curr: CurrencyType): void {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, curr);
  },

  getUserProfile(): { name: string; email: string; avatarUrl: string } {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      name: 'Jonathan Miller',
      email: 'jonathan.m@celebrato.io',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    };
  },
};
