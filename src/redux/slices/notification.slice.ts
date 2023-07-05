import { createSlice } from '@reduxjs/toolkit';

import {
  fetchNotificationsApi,
  updateNotificationsApi,
} from '@apis/notification';
import { createAsyncThunk } from '@redux/redux.helper';

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

    return response;
  },
);

const markNotificationSeen = createAsyncThunk(
  'app/Notification/MARK_NOTIFICATION_SEEN',
  async (notificationId: string | string[]) => {
    await updateNotificationsApi({
      notificationId,
      updateData: { seen: true },
    });
  },
);

const markOldNotification = createAsyncThunk(
  'app/Notification/MARK_OLD_NOTIFICATION',
  async (notificationId: string | string[]) => {
    await updateNotificationsApi({
      notificationId,
      updateData: { isNew: false },
    });
  },
);

export const NotificationThunks = {
  fetchNotifications,
  markNotificationSeen,
  markOldNotification,
};

// ================ Slice ================ //
const NotificationSlice = createSlice({
  name: 'Notification',
  initialState,
  reducers: {},
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
