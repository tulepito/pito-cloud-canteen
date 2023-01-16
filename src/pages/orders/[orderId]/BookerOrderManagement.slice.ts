import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import { loadBookerOrderDataApi } from '@utils/api';
import type { TObject } from '@utils/types';

// ================ Initial states ================ //
type TBookerOrderManagementState = {
  isFetchingOrderDetail: boolean;
  orderData: TObject | null;
  planData: TObject | null;
};
const initialState: TBookerOrderManagementState = {
  isFetchingOrderDetail: false,
  orderData: null,
  planData: null,
};

// ================ Thunk types ================ //

// ================ Async thunks ================ //
const loadData = createAsyncThunk(
  'app/BookerOrderManagements/LOAD_DATA',
  async (orderId: string) => {
    const response: any = await loadBookerOrderDataApi(orderId);
    return response.data;
  },
);

export const BookerOrderManagementsThunks = {
  loadData,
};

// ================ Slice ================ //
const BookerOrderManagementSlice = createSlice({
  name: 'BookerOrderManagement',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadData.pending, (state) => {
        state.isFetchingOrderDetail = true;
      })
      .addCase(loadData.fulfilled, (state, { payload }) => {
        const { orderListing, planListing } = payload;
        state.isFetchingOrderDetail = false;
        state.orderData = orderListing;
        state.planData = planListing;
      })
      .addCase(loadData.rejected, (state) => {
        state.isFetchingOrderDetail = false;
      });
  },
});

// ================ Actions ================ //
export const BookerOrderManagementsAction = BookerOrderManagementSlice.actions;
export default BookerOrderManagementSlice.reducer;

// ================ Selectors ================ //
