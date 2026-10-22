import { useState, useCallback, useMemo } from 'react';
import type { AppNotification } from '../types';
import { StorageService } from '../services/storage';

export interface UseNotificationsResult {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
}

/**
 * Custom React hook for encapsulated notification management with LocalStorage persistence.
 */
export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    StorageService.getNotifications()
  );

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      StorageService.saveNotifications(next);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      StorageService.saveNotifications(next);
      return next;
    });
  }, []);

  const addNotification = useCallback(
    (item: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
      setNotifications((prev) => {
        const newNotif: AppNotification = {
          ...item,
          id: `notif-${Date.now()}`,
          timestamp: 'Just now',
          read: false,
        };
        const next = [newNotif, ...prev];
        StorageService.saveNotifications(next);
        return next;
      });
    },
    []
  );

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
  };
}
