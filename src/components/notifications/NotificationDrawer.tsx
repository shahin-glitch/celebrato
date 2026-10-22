import React, { useEffect } from 'react';
import type { AppNotification } from '../../types';
import { Bell, X, CheckCheck } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigate: (tab: string, targetId?: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onNavigate,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-drawer-title"
      className="fixed inset-0 z-50 flex items-start justify-end p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-[#FCFBF7] w-full max-w-sm rounded-[24px] neo-border neo-shadow-lg p-5 mt-14 mr-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/10">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#171717]" />
            <h3 id="notification-drawer-title" className="font-mono-code font-bold text-sm text-[#171717]">
              Notifications & Reminders
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close notifications"
            className="p-1 hover:bg-black/10 rounded-full cursor-pointer text-[#171717]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mark All Read button */}
        <div className="flex justify-end">
          <button
            onClick={onMarkAllRead}
            aria-label="Mark all as read"
            className="flex items-center gap-1 font-mono-code text-[11px] font-bold text-[#565656] hover:text-[#171717] cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
        </div>

        {/* Notification Items */}
        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto">
          {notifications.map((notif) => {
            const handleItemClick = () => {
              onMarkRead(notif.id);
              if (notif.targetTab) {
                onNavigate(notif.targetTab, notif.targetId);
              }
              onClose();
            };

            return (
              <div
                key={notif.id}
                role="button"
                tabIndex={0}
                aria-label={`${notif.title}: ${notif.message}`}
                onClick={handleItemClick}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleItemClick();
                  }
                }}
                className={`p-3 rounded-xl neo-border transition-all cursor-pointer ${
                  notif.read
                    ? 'bg-white opacity-70 hover:opacity-100'
                    : 'bg-[#FDF189] neo-shadow-sm border-[#171717]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-xs text-[#171717]">
                    {notif.title}
                  </span>
                  <span className="font-mono-code text-[10px] text-[#565656] shrink-0">
                    {notif.timestamp}
                  </span>
                </div>
                <p className="text-[11px] text-[#565656] mt-1 leading-snug">
                  {notif.message}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
