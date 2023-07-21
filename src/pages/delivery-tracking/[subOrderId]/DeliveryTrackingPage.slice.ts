import { createSlice } from '@reduxjs/toolkit';

import { createAsyncThunk } from '@redux/redux.helper';
import type { TObject } from '@src/utils/types';

import { queryDeliveryInfoApi } from '../../../apis/index';

// ================ Initial states ================ //
type TDeliveryTrackingPageState = {
  loadDataInProgress: boolean;
  order: TObject;
};
const initialState: TDeliveryTrackingPageState = {
  loadDataInProgress: false,
  order: {},
};

// ================ Thunk types ================ //

// ================ Async thunks ================ //
const loadData = createAsyncThunk(
  'app/DeliveryTrackingPage/LOAD_DATA',
  async ({ orderId, date }: TObject) => {
    const response = await queryDeliveryInfoApi({ orderId, date });

    return response?.data || {};
  },
);

export const DeliveryTrackingPageThunks = {
  loadData,
};

// ================ Slice ================ //
const DeliveryTrackingPageSlice = createSlice({
  name: 'DeliveryTrackingPage',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* =============== loadData =============== */
      .addCase(loadData.pending, (state) => {
        state.loadDataInProgress = true;
      })
      .addCase(loadData.fulfilled, (state, { payload }) => {
        return { ...state, loadDataInProgress: false, order: payload };
      })
      .addCase(loadData.rejected, (state) => {
        state.loadDataInProgress = false;
      });
  },
});

// ================ Actions ================ //
export const DeliveryTrackingPageActions = DeliveryTrackingPageSlice.actions;
export default DeliveryTrackingPageSlice.reducer;

// ================ Selectors ================ //
