import { create } from 'zustand';
import { Notification } from '@/types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) => {
    const unread = notifications.filter(n => !n.is_read).length;
    set({ notifications, unreadCount: unread });
  },

  addNotification: (notification) => {
    set((state) => {
      const updated = [notification, ...state.notifications];
      return {
        notifications: updated,
        unreadCount: state.unreadCount + (notification.is_read ? 0 : 1),
      };
    });
  },

  markAsRead: (id) => {
    set((state) => {
      let unreadDiff = 0;
      const updated = state.notifications.map((n) => {
        if (n.id === id && !n.is_read) {
          unreadDiff = -1;
          return { ...n, is_read: true };
        }
        return n;
      });
      return {
        notifications: updated,
        unreadCount: Math.max(0, state.unreadCount + unreadDiff),
      };
    });
  },

  markAllAsRead: () => {
    set((state) => {
      const updated = state.notifications.map((n) => ({ ...n, is_read: true }));
      return {
        notifications: updated,
        unreadCount: 0,
      };
    });
  },
}));
