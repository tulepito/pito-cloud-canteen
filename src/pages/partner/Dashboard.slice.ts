import { createSlice } from '@reduxjs/toolkit';

import {
  queryAllPartnerPaymentRecordsApi,
  queryPartnerOrdersApi,
} from '@apis/partnerApi';
import { createAsyncThunk } from '@redux/redux.helper';
import { CurrentUser } from '@src/utils/data';
import { EOrderStates } from '@src/utils/enums';
import type { TObject, TPaymentRecord } from '@src/utils/types';

// ================ Initial states ================ //
type TPartnerDashboardState = {
  subOrders: TObject[];
  fetchSubOrdersInProgress: boolean;
  fetchSubOrdersError: any;

  paymentRecords: TPaymentRecord[];
  fetchPartnerFirebasePaymentRecordInProgress: boolean;
  fetchPartnerFirebasePaymentRecordError: any;
};
const initialState: TPartnerDashboardState = {
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
    const { currentUser } = getState().user;
    const { restaurantListingId } = CurrentUser(currentUser!).getMetadata();
    const response = await queryPartnerOrdersApi(restaurantListingId, {
      ...payload,
      orderStates: [
        EOrderStates.inProgress,
        EOrderStates.completed,
        EOrderStates.reviewed,
        EOrderStates.pendingPayment,
      ],
    });

    const { orders = [] } = response?.data || {};

    return orders;
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
  reducers: {},
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
        state.subOrders = action.payload;
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
