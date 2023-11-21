import { createSlice } from '@reduxjs/toolkit';

import {
  queryPartnerOrderDetailApi,
  transitSubOrderTransactionApi,
} from '@apis/partnerApi';
import { fetchTxApi } from '@apis/txApi';
import { createAsyncThunk } from '@redux/redux.helper';
import { CurrentUser, Listing } from '@src/utils/data';
import type { TObject, TTransaction } from '@src/utils/types';

// ================ Initial states ================ //
type TPartnerSubOrderDetailState = {
  order: TObject;
  transaction: TTransaction | null;
  fetchOrderInProgress: boolean;
  fetchOrderError: any;
  queryTransactionInProgress: boolean;
  transitInProgress: boolean;
};
const initialState: TPartnerSubOrderDetailState = {
  order: {},
  transaction: null,
  fetchOrderError: null,
  fetchOrderInProgress: false,
  queryTransactionInProgress: false,
  transitInProgress: false,
};

// ================ Thunk types ================ //

// ================ Async thunks ================ //
const queryTransaction = createAsyncThunk(
  'app/PartnerSubOrderDetail/QUERY_TRANSACTION',
  async (transactionId: string) => {
    const txResponse = await fetchTxApi(transactionId);

    return txResponse?.data || {};
  },
);

const loadData = createAsyncThunk(
  'app/PartnerSubOrderDetail/LOAD_DATA',
  async ({ orderId, date }: TObject, { getState, dispatch }) => {
    const { currentUser } = getState().user;
    const { restaurantListingId } = CurrentUser(currentUser!).getMetadata();

    if (restaurantListingId) {
      const response = await queryPartnerOrderDetailApi({
        partnerId: restaurantListingId,
        orderId,
        date,
      });

      const { orderDetail } = Listing(response?.data?.plan || {}).getMetadata();
      const { transactionId } = orderDetail[date] || {};
      if (transactionId) {
        dispatch(queryTransaction(transactionId));
      }

      return response?.data || {};
    }

    return {};
  },
);

const transitSubOrderTransaction = createAsyncThunk(
  'app/PartnerSubOrderDetail/TRANSIT_SUB_ORDER_TRANSACTION',
  async (
    { orderId, subOrderDate, transactionId, newTransition }: TObject,
    { getState, rejectWithValue },
  ) => {
    try {
      const { currentUser } = getState().user;
      const { restaurantListingId } = CurrentUser(currentUser!).getMetadata();

      if (restaurantListingId) {
        const response = await transitSubOrderTransactionApi({
          partnerId: restaurantListingId,
          orderId,
          subOrderDate,
          transactionId,
          newTransition,
        });

        return response?.data || {};
      }

      return {};
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const PartnerSubOrderDetailThunks = {
  loadData,
  transitSubOrderTransaction,
};

// ================ Slice ================ //
const PartnerSubOrderDetailSlice = createSlice({
  name: 'PartnerSubOrderDetail',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* =============== queryTransaction=============== */
      .addCase(queryTransaction.pending, (state) => {
        state.queryTransactionInProgress = true;
      })
      .addCase(queryTransaction.fulfilled, (state, { payload }) => {
        state.queryTransactionInProgress = false;
        state.transaction = payload;
      })
      .addCase(queryTransaction.rejected, (state) => {
        state.queryTransactionInProgress = false;
      })
      /* =============== loadData =============== */
      .addCase(loadData.pending, (state) => {
        state.fetchOrderInProgress = true;
        state.fetchOrderError = null;
      })
      .addCase(loadData.fulfilled, (state, { payload }) => {
        state.order = payload;
        state.fetchOrderInProgress = false;
      })
      .addCase(loadData.rejected, (state) => {
        state.fetchOrderInProgress = false;
      })
      /* =============== transitSubOrderTransaction =============== */
      .addCase(transitSubOrderTransaction.pending, (state) => {
        state.transitInProgress = true;
      })
      .addCase(transitSubOrderTransaction.fulfilled, (state, { payload }) => {
        const { plan, transaction } = payload || {};

        state.transitInProgress = false;
        state.order = {
          ...state.order,
          plan,
        };
        state.transaction = transaction;
      })
      .addCase(transitSubOrderTransaction.rejected, (state) => {
        state.transitInProgress = false;
      });
  },
});

// ================ Actions ================ //
export const PartnerSubOrderDetailActions = PartnerSubOrderDetailSlice.actions;
export default PartnerSubOrderDetailSlice.reducer;

// ================ Selectors ================ //
