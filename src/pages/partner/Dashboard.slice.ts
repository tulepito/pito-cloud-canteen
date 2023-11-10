import { createSlice } from '@reduxjs/toolkit';

import {
  queryAllPartnerPaymentRecordsApi,
  queryPartnerOrdersApi,
} from '@apis/partnerApi';
import { createAsyncThunk } from '@redux/redux.helper';
import { CurrentUser } from '@src/utils/data';
import { EOrderStates, ETimeFrame, ETimePeriodOption } from '@src/utils/enums';
import type { TObject, TPaymentRecord } from '@src/utils/types';

// ================ Initial states ================ //
type TPartnerDashboardState = {
  startDate: number | null;
  endDate: number | null;
  timePeriodOption: ETimePeriodOption;
  analyticsRevenueTimeFrame: ETimeFrame;
  analyticsOrdersTimeFrame: ETimeFrame;

  previousSubOrders: TObject[];
  fetchPreviousSubOrdersInProgress: boolean;
  fetchPreviousSubOrdersError: any;

  subOrders: TObject[];
  fetchSubOrdersInProgress: boolean;
  fetchSubOrdersError: any;

  paymentRecords: TPaymentRecord[];
  fetchPartnerFirebasePaymentRecordInProgress: boolean;
  fetchPartnerFirebasePaymentRecordError: any;
};
const initialState: TPartnerDashboardState = {
  startDate: null,
  endDate: null,
  timePeriodOption: ETimePeriodOption.CUSTOM,
  analyticsRevenueTimeFrame: ETimeFrame.MONTH,
  analyticsOrdersTimeFrame: ETimeFrame.MONTH,

  previousSubOrders: [],
  fetchPreviousSubOrdersInProgress: false,
  fetchPreviousSubOrdersError: null,

  subOrders: [],
  fetchSubOrdersInProgress: false,
  fetchSubOrdersError: null,

  paymentRecords: [],
  fetchPartnerFirebasePaymentRecordInProgress: false,
  fetchPartnerFirebasePaymentRecordError: null,
};

// ================ Thunk types ================ //
const FETCH_SUB_ORDERS = 'app/PartnerDashboard/FETCH_SUB_ORDERS';
const FETCH_PARTNER_FIREBASE_PAYMENT_RECORD =
  'app/PartnerDashboard/FETCH_PARTNER_FIREBASE_PAYMENT_RECORD';

// ================ Async thunks ================ //
const fetchSubOrders = createAsyncThunk(
  FETCH_SUB_ORDERS,
  async (payload: TObject, { getState }) => {
    const { currentSubOrderParams, previousSubOrdersParams } = payload;
    const { currentUser } = getState().user;
    const { restaurantListingId } = CurrentUser(currentUser!).getMetadata();
    const allowedOrderStates = [
      EOrderStates.inProgress,
      EOrderStates.completed,
      EOrderStates.reviewed,
      EOrderStates.pendingPayment,
    ];
    const response = await queryPartnerOrdersApi(restaurantListingId, {
      ...currentSubOrderParams,
      orderStates: allowedOrderStates,
    });

    const previousResponse = await queryPartnerOrdersApi(restaurantListingId, {
      ...previousSubOrdersParams,
      orderStates: allowedOrderStates,
    });

    const { orders = [] } = response?.data || {};
    const { orders: previousOrders = [] } = previousResponse?.data || {};

    return {
      subOrders: orders,
      previousSubOrders: previousOrders,
    };
  },
);

const fetchPartnerFirebasePaymentRecord = createAsyncThunk(
  FETCH_PARTNER_FIREBASE_PAYMENT_RECORD,
  async (payload: TObject, { getState }) => {
    const { currentUser } = getState().user;
    const { restaurantListingId } = CurrentUser(currentUser!).getMetadata();

    const { data: allPaymentRecords } = await queryAllPartnerPaymentRecordsApi({
      partnerId: restaurantListingId,
    });

    return allPaymentRecords;
  },
);

export const PartnerDashboardThunks = {
  fetchPartnerFirebasePaymentRecord,
  fetchSubOrders,
};

// ================ Slice ================ //
const PartnerDashboardSlice = createSlice({
  name: 'PartnerDashboard',
  initialState,
  reducers: {
    setAnalyticsRevenueTimeFrame(state, action) {
      state.analyticsRevenueTimeFrame = action.payload;
    },
    setAnalyticsOrdersTimeFrame(state, action) {
      state.analyticsOrdersTimeFrame = action.payload;
    },
    setTimePeriodOption(state, action) {
      state.timePeriodOption = action.payload;
    },
    setStartDate(state, action) {
      state.startDate = action.payload;
    },
    setEndDate(state, action) {
      state.endDate = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPartnerFirebasePaymentRecord.pending, (state) => {
        state.fetchPartnerFirebasePaymentRecordInProgress = true;
        state.fetchPartnerFirebasePaymentRecordError = null;
      })
      .addCase(fetchPartnerFirebasePaymentRecord.fulfilled, (state, action) => {
        state.fetchPartnerFirebasePaymentRecordInProgress = false;
        state.paymentRecords = action.payload;
      })
      .addCase(fetchPartnerFirebasePaymentRecord.rejected, (state, action) => {
        state.fetchPartnerFirebasePaymentRecordInProgress = false;
        state.fetchPartnerFirebasePaymentRecordError = action.error;
      })

      .addCase(fetchSubOrders.pending, (state) => {
        state.fetchSubOrdersInProgress = true;
        state.fetchSubOrdersError = null;
      })
      .addCase(fetchSubOrders.fulfilled, (state, action) => {
        state.fetchSubOrdersInProgress = false;
        state.subOrders = action.payload.subOrders;
        state.previousSubOrders = action.payload.previousSubOrders;
      })
      .addCase(fetchSubOrders.rejected, (state, action) => {
        state.fetchSubOrdersInProgress = false;
        state.fetchSubOrdersError = action.error;
      });
  },
});

// ================ Actions ================ //
export const PartnerDashboardActions = PartnerDashboardSlice.actions;
export default PartnerDashboardSlice.reducer;

// ================ Selectors ================ //
