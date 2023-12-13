import { createSlice, current } from '@reduxjs/toolkit';

import { fetchBookerNotificationsApi } from '@apis/companyApi';
import { getCompaniesApi } from '@apis/index';
import { updateNotificationsApi } from '@apis/notificationApi';
import { createAsyncThunk } from '@redux/redux.helper';
import { User } from '@src/utils/data';
import type { TUser } from '@src/utils/types';

import { QuizActions, QuizThunks } from './Quiz.slice';

// ================ Initial states ================ //
type TBookerCompaniesState = {
  companies: TUser[];

  notifications: any[];
  fetchBookerNotificationsInProgress: boolean;
  fetchBookerNotificationsError: any;
};
const initialState: TBookerCompaniesState = {
  companies: [],

  notifications: [],
  fetchBookerNotificationsInProgress: false,
  fetchBookerNotificationsError: null,
};

// ================ Thunk types ================ //
const FETCH_BOOKER_COMPANIES = 'app/BookerCompanies/FETCH_BOOKER_COMPANIES';
const FETCH_BOOKER_NOTIFICATIONS =
  'app/BookerCompanies/FETCH_BOOKER_NOTIFICATIONS';
const MARK_NOTIFICATION_SEEN = 'app/BookerCompanies/MARK_NOTIFICATION_SEEN';

// ================ Async thunks ================ //
const fetchBookerCompanies = createAsyncThunk(
  FETCH_BOOKER_COMPANIES,
  async (_, { dispatch }) => {
    const { data: response } = await getCompaniesApi();
    const [firstCompanyMaybe] = response || [];
    const firstCompanyId = User(firstCompanyMaybe).getId();
    dispatch(QuizActions.setSelectedCompany(firstCompanyMaybe));

    if (firstCompanyId) {
      dispatch(QuizThunks.queryCompanyOrders(firstCompanyId));
    }

    return response;
  },
);

const fetchBookerNotifications = createAsyncThunk(
  FETCH_BOOKER_NOTIFICATIONS,
  async () => {
    const { data: response } = await fetchBookerNotificationsApi();

    return response;
  },
);

const markNotificationSeen = createAsyncThunk(
  MARK_NOTIFICATION_SEEN,
  async (notificationIds: string[]) => {
    await updateNotificationsApi({
      notificationIds,
      updateData: { seen: true },
    });
  },
);

export const BookerCompaniesThunks = {
  fetchBookerCompanies,
  fetchBookerNotifications,
  markNotificationSeen,
};

// ================ Slice ================ //
const BookerCompaniesSlice = createSlice({
  name: 'BookerCompanies',
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookerCompanies.fulfilled, (state, action) => {
        state.companies = action.payload;
      })
      .addCase(fetchBookerNotifications.pending, (state) => {
        state.fetchBookerNotificationsInProgress = true;
      })
      .addCase(fetchBookerNotifications.fulfilled, (state, action) => {
        state.fetchBookerNotificationsInProgress = false;
        state.notifications = action.payload;
      })
      .addCase(fetchBookerNotifications.rejected, (state, action) => {
        state.fetchBookerNotificationsInProgress = false;
        state.fetchBookerNotificationsError = action.error;
      });
  },
});

// ================ Actions ================ //
export const BookerCompaniesActions = BookerCompaniesSlice.actions;
export default BookerCompaniesSlice.reducer;

// ================ Selectors ================ //
