import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '../../types';
import { dummyNotifications } from '../../data/dummyLeads';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
}

const initialState: NotificationsState = {
  notifications: dummyNotifications,
  unreadCount: dummyNotifications.filter(n => !n.read).length,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const newNotif: Notification = {
        ...action.payload,
        id: `notif-${Date.now()}`,
        timestamp: new Date().toISOString(),
        read: false
      };
      state.notifications.unshift(newNotif);
      state.unreadCount = state.notifications.filter(n => !n.read).length;
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notif = state.notifications.find(n => n.id === action.payload);
      if (notif && !notif.read) {
        notif.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => {
        n.read = true;
      });
      state.unreadCount = 0;
    },
    deleteNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const wasUnread = !state.notifications[index].read;
        state.notifications.splice(index, 1);
        if (wasUnread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    }
  }
});

export const { addNotification, markAsRead, markAllAsRead, deleteNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
