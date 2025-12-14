import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationsAPI } from '../../services/api';

// Async actions
export const fetchNotifications = createAsyncThunk('notifications/fetchAll', async () => {
  const response = await notificationsAPI.getAll();
  return Array.isArray(response.data) ? response.data : (response.data?.data || []);
});

export const markNotificationAsRead = createAsyncThunk('notifications/markAsRead', async (id) => {
  await notificationsAPI.markAsRead(id);
  return id;
});

export const markAllNotificationsAsRead = createAsyncThunk('notifications/markAllAsRead', async () => {
  await notificationsAPI.markAllAsRead();
});

export const generateNotifications = createAsyncThunk('notifications/generate', async () => {
  const response = await notificationsAPI.generate();
  return response.data;
});

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.is_read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Mark as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification) {
          notification.is_read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // Mark all as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => n.is_read = true);
        state.unreadCount = 0;
      })
      // Generate notifications
      .addCase(generateNotifications.fulfilled, (state) => {
        // سيتم جلب الإشعارات مرة أخرى
      });
  },
});

export const { clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
