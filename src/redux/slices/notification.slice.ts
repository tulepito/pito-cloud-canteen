import { createSlice, current } from '@reduxjs/toolkit';

import {
  fetchNotificationsApi,
  updateNotificationsApi,
} from '@apis/notificationApi';
import { createAsyncThunk } from '@redux/redux.helper';
import { ENotificationType } from '@src/utils/enums';
import type { TObject } from '@src/utils/types';

// ================ Initial states ================ //
type TNotificationState = {
  notifications: any[];
  fetchNotificationsInProgress: boolean;
  fetchNotificationsError: any;
};
const initialState: TNotificationState = {
  notifications: [],
  fetchNotificationsInProgress: false,
  fetchNotificationsError: null,
};

// ================ Thunk types ================ //

// ================ Async thunks ================ //
const fetchNotifications = createAsyncThunk(
  'app/Notification/FETCH_NOTIFICATIONS',
  async () => {
    const { data: response = [] } = await fetchNotificationsApi();
    const filteredResponse = response.filter(
      (notification: TObject) =>
        notification.notificationType !==
          ENotificationType.SUB_ORDER_REVIEWED_BY_PARTICIPANT &&
        notification.notificationType !==
          ENotificationType.SUB_ORDER_REVIEWED_BY_BOOKER,
    );

    return filteredResponse;
  },
);

const markNotificationsSeen = createAsyncThunk(
  'app/Notification/MARK_NOTIFICATION_SEEN',
  async (notificationIds: string[]) => {
    await updateNotificationsApi({
      notificationIds,
      updateData: { seen: true },
    });
  },
);

const markAllNotificationsAreOld = createAsyncThunk(
  'app/Notification/MARK_OLD_NOTIFICATION',
  async (notificationIds: string[]) => {
    await updateNotificationsApi({
      notificationIds,
      updateData: { isNew: false },
    });
  },
);

export const NotificationThunks = {
  fetchNotifications,
  markNotificationsSeen,
  markAllNotificationsAreOld,
};

// ================ Slice ================ //
const NotificationSlice = createSlice({
  name: 'Notification',
  initialState,
  reducers: {
    markNotificationsSeen: (state, action) => {
      const notificationIds = action.payload;
      const { notifications = [] } = current(state);

      state.notifications = notifications.map((notification) => {
        if (notificationIds.includes(notification.id)) {
          return {
            ...notification,
            seen: true,
          };
        }

        return notification;
      });
    },
    markAllNotificationsAreOld: (state, { payload }) => {
      const notificationIds = payload;
      const { notifications = [] } = current(state);

      state.notifications = notifications.map((notification) => {
        if (notificationIds.includes(notification.id)) {
          return {
            ...notification,
            isNew: false,
          };
        }

        return notification;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.fetchNotificationsInProgress = true;
        state.fetchNotificationsError = false;
      })
      .addCase(fetchNotifications.fulfilled, (state, { payload }) => {
        state.fetchNotificationsInProgress = false;
        state.notifications = payload;
      })
      .addCase(fetchNotifications.rejected, (state, { error }) => {
        state.fetchNotificationsInProgress = false;
        state.fetchNotificationsError = error.message;
      });
  },
});

// ================ Actions ================ //
export const NotificationActions = NotificationSlice.actions;
export default NotificationSlice.reducer;

// ================ Selectors ================ //
