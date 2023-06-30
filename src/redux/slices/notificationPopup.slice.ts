import { createSlice } from '@reduxjs/toolkit';

import { createAsyncThunk } from '@redux/redux.helper';
import { ENotificationPopupTypes } from '@src/utils/enums';
import type { TNotification } from '@src/utils/types';

const HIDE_NOTIFICATION_TIMEOUT_MS = 5000;
const REMOVE_NOTIFICATION_TIMEOUT_MS = 5500;

// ================ Initial states ================ //
type TNotificationStates = {
  notifications: TNotification[];
};

const initialState: TNotificationStates = {
  notifications: [],
};

// ================ Thunk types ================ //

// ================ Async thunks ================ //

const delayedHideNotifications = createAsyncThunk(
  'notificationPopup/DELAYED_HIDE_NOTIFICATIONS',
  async (payload: TNotification, { getState, dispatch }) => {
    const a = setTimeout(() => {
      const newNotifications = [...getState().notificationPopup.notifications];
      const notifications = newNotifications.map((item) => {
        return item.id == payload.id ? { ...item, hidden: true } : item;
      });
      dispatch(NotificationSlice.actions.renewNotifications(notifications));
      clearTimeout(a);
    }, HIDE_NOTIFICATION_TIMEOUT_MS);

    const b = setTimeout(() => {
      const newNotifications = [...getState().notificationPopup.notifications];
      const notifications = newNotifications.filter(
        (item) => item.id !== payload.id,
      );
      dispatch(NotificationSlice.actions.renewNotifications(notifications));
      clearTimeout(b);
    }, REMOVE_NOTIFICATION_TIMEOUT_MS);
  },
);

export const NotificationThunks = {
  delayedHideNotifications,
};

// ================ Slice ================ //
const NotificationSlice = createSlice({
  name: 'Notification.slice',
  initialState,
  reducers: {
    renewNotifications: (state, { payload }) => {
      state.notifications = payload;
    },
    triggerSuccessNotification: (state, { payload }) => {
      state.notifications = [
        ...state.notifications,
        { ...payload, type: ENotificationPopupTypes.success },
      ];
    },
    triggerWarningNotification: (state, { payload }) => {
      state.notifications = [
        ...state.notifications,
        { ...payload, type: ENotificationPopupTypes.warning },
      ];
    },
    triggerErrorNotification: (state, { payload }) => {
      state.notifications = [
        ...state.notifications,
        { ...payload, type: ENotificationPopupTypes.error },
      ];
    },
  },
  extraReducers: () => {},
});

// ================ Actions ================ //
export const NotificationSliceAction = NotificationSlice.actions;
export default NotificationSlice.reducer;

// ================ Selectors ================ //
