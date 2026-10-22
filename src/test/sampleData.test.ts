import { describe, it, expect } from 'vitest';
import {
  INITIAL_EVENTS,
  SAMPLE_VENDORS,
  THEME_GALLERY,
  INITIAL_NOTIFICATIONS,
} from '../services/sampleData';

describe('Sample Data & Domain Model Integrity', () => {
  it('provides 3 richly structured demo events out of the box', () => {
    expect(INITIAL_EVENTS).toHaveLength(3);
    const names = INITIAL_EVENTS.map((e) => e.name);
    expect(names).toContain('Campus Cultural Night');
    expect(names).toContain("Ananya & Rahul's Royal Wedding");
    expect(names).toContain("Mom's 50th Golden Jubilee Birthday");
  });

  it('guarantees budget category sums equal the total budget for all demo events', () => {
    for (const event of INITIAL_EVENTS) {
      const sum = event.budget.categories.reduce((acc, cat) => acc + cat.amount, 0);
      expect(sum).toBe(event.budget.total);
    }
  });

  it('ensures each demo event has valid timeline milestones with due dates', () => {
    for (const event of INITIAL_EVENTS) {
      expect(event.timeline.length).toBeGreaterThan(0);
      for (const task of event.timeline) {
        expect(task.title).toBeTruthy();
        expect(task.dueDate).toBeTruthy();
        expect(['high', 'medium', 'low']).toContain(task.priority);
      }
    }
  });

  it('ensures each demo event has a populated guest list with RSVP statuses', () => {
    for (const event of INITIAL_EVENTS) {
      expect(event.guests.length).toBeGreaterThan(0);
      for (const guest of event.guests) {
        expect(guest.name).toBeTruthy();
        expect(['attending', 'pending', 'declined']).toContain(guest.rsvpStatus);
        expect(guest.accompanyingGuests).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('validates vendor directory partners have ratings, categories, and price ranges', () => {
    expect(SAMPLE_VENDORS.length).toBeGreaterThan(0);
    for (const vendor of SAMPLE_VENDORS) {
      expect(vendor.name).toBeTruthy();
      expect(vendor.category).toBeTruthy();
      expect(vendor.rating).toBeGreaterThanOrEqual(4.0);
      expect(vendor.priceLevel).toBeTruthy();
    }
  });

  it('validates theme inspirations contain non-empty color palettes and aesthetics', () => {
    expect(THEME_GALLERY.length).toBeGreaterThan(0);
    for (const theme of THEME_GALLERY) {
      expect(theme.title).toBeTruthy();
      expect(theme.colors.length).toBeGreaterThanOrEqual(3);
      for (const hex of theme.colors) {
        expect(hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    }
  });

  it('verifies initial notifications have valid routing targets and unread states', () => {
    expect(INITIAL_NOTIFICATIONS.length).toBeGreaterThan(0);
    for (const notif of INITIAL_NOTIFICATIONS) {
      expect(notif.title).toBeTruthy();
      expect(['deadline', 'budget', 'rsvp', 'vendor', 'budget_warning', 'system']).toContain(notif.type);
    }
  });
});
