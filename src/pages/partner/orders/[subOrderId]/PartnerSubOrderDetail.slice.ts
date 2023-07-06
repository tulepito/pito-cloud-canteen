import { createSlice } from '@reduxjs/toolkit';

import { queryPartnerOrderDetailApi } from '@apis/partnerApi';
import { createAsyncThunk } from '@redux/redux.helper';
import { CurrentUser } from '@src/utils/data';
import type { TObject } from '@src/utils/types';

// ================ Initial states ================ //
type TPartnerSubOrderDetailState = {
  order: TObject;
  fetchOrderInProgress: boolean;
  fetchOrderError: any;
};
const initialState: TPartnerSubOrderDetailState = {
  order: {},
  fetchOrderError: null,
  fetchOrderInProgress: false,
};

// ================ Thunk types ================ //

// ================ Async thunks ================ //
const loadData = createAsyncThunk(
  'app/PartnerSubOrderDetail/LOAD_DATA',
  async ({ orderId, date }: TObject, { getState }) => {
    const { currentUser } = getState().user;
    const { restaurantListingId } = CurrentUser(currentUser!).getMetadata();

    if (restaurantListingId) {
      const response = await queryPartnerOrderDetailApi({
        partnerId: restaurantListingId,
        orderId,
        date,
      });

      return response?.data || {};
    }

    return {};
  },
);

export const PartnerSubOrderDetailThunks = {
  loadData,
};

// ================ Slice ================ //
const PartnerSubOrderDetailSlice = createSlice({
  name: 'PartnerSubOrderDetail',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
      });
  },
});

// ================ Actions ================ //
export const PartnerSubOrderDetailActions = PartnerSubOrderDetailSlice.actions;
export default PartnerSubOrderDetailSlice.reducer;

// ================ Selectors ================ //
