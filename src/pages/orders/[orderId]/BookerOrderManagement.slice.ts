import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import {
  deleteParticipantFromOrderApi,
  loadBookerOrderDataApi,
} from '@utils/api';
import type { TObject, TUser } from '@utils/types';

// ================ Initial states ================ //
type TBookerOrderManagementState = {
  isFetchingOrderDetail: boolean;
  companyId: string | null;
  orderData: TObject | null;
  planData: TObject | null;
  participantData: Array<TUser>;

  isDeletingParticipant: boolean;
};
const initialState: TBookerOrderManagementState = {
  isFetchingOrderDetail: false,
  companyId: null,
  orderData: null,
  planData: null,
  participantData: [],
  isDeletingParticipant: false,
};

// ================ Thunk types ================ //

// ================ Async thunks ================ //
const loadData = createAsyncThunk(
  'app/BookerOrderManagement/LOAD_DATA',
  async (orderId: string) => {
    const response: any = await loadBookerOrderDataApi(orderId);
    return response.data;
  },
);

const deleteParticipant = createAsyncThunk(
  'app/BookerOrderManagement/DELETE_PARTICIPANT',
  async (params: TObject, { getState }) => {
    const orderId = getState().BookerOrderManagement.orderData!.id.uuid;
    const response: any = await deleteParticipantFromOrderApi(orderId, params);
    return response;
  },
);

export const BookerOrderManagementsThunks = {
  loadData,
  deleteParticipant,
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
        const {
          orderListing: orderData,
          planListing: planData,
          ...restPayload
        } = payload;

        return {
          ...state,
          isFetchingOrderDetail: false,
          orderData,
          planData,
          ...restPayload,
        };
      })
      .addCase(loadData.rejected, (state) => {
        state.isFetchingOrderDetail = false;
      })

      .addCase(deleteParticipant.pending, (state) => {
        state.isDeletingParticipant = true;
      })
      .addCase(deleteParticipant.fulfilled, (state) => {
        state.isDeletingParticipant = false;
      })
      .addCase(deleteParticipant.rejected, (state) => {
        state.isDeletingParticipant = false;
      });
  },
});

// ================ Actions ================ //
export const BookerOrderManagementsAction = BookerOrderManagementSlice.actions;
export default BookerOrderManagementSlice.reducer;

// ================ Selectors ================ //
