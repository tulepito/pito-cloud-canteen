import { createSlice } from '@reduxjs/toolkit';

import { queryPartnerOrdersApi } from '@apis/partnerApi';
import { createAsyncThunk } from '@redux/redux.helper';
import { CurrentUser } from '@src/utils/data';
import { EOrderStates, ETimeFrame, ETimePeriodOption } from '@src/utils/enums';
import type { TObject } from '@src/utils/types';

// ================ Initial states ================ //
type TPartnerDashboardState = {
  startDate: number | null;
  endDate: number | null;
  timePeriodOption: ETimePeriodOption;
  analyticsRevenueTimeFrame: ETimeFrame;
  analyticsOrdersTimeFrame: ETimeFrame;

  previousSubOrders: TObject[];
  latestSubOrders: TObject[];

  subOrders: TObject[];
  fetchSubOrdersInProgress: boolean;
  fetchSubOrdersError: any;
};
const initialState: TPartnerDashboardState = {
  startDate: null,
  endDate: null,
  timePeriodOption: ETimePeriodOption.CUSTOM,
  analyticsRevenueTimeFrame: ETimeFrame.MONTH,
  analyticsOrdersTimeFrame: ETimeFrame.MONTH,

  previousSubOrders: [],
  latestSubOrders: [],

  subOrders: [],
  fetchSubOrdersInProgress: false,
  fetchSubOrdersError: null,
};

// ================ Thunk types ================ //
const FETCH_SUB_ORDERS = 'app/PartnerDashboard/FETCH_SUB_ORDERS';

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
    const latestResponse = await queryPartnerOrdersApi(restaurantListingId, {
      orderStates: allowedOrderStates,
    });

    const { orders = [] } = response?.data || {};
    const { orders: previousOrders = [] } = previousResponse?.data || {};
    const { orders: latestOrders = [] } = latestResponse?.data || {};

    return {
      subOrders: orders,
      previousSubOrders: previousOrders,
      latestSubOrders: latestOrders,
    };
  },
);

export const PartnerDashboardThunks = {
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

      .addCase(fetchSubOrders.pending, (state) => {
        state.fetchSubOrdersInProgress = true;
        state.fetchSubOrdersError = null;
      })
      .addCase(fetchSubOrders.fulfilled, (state, action) => {
        state.fetchSubOrdersInProgress = false;
        state.subOrders = action.payload.subOrders;
        state.previousSubOrders = action.payload.previousSubOrders;
        state.latestSubOrders = action.payload.latestSubOrders;
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
