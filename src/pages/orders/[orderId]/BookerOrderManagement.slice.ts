import { createAsyncThunk } from '@redux/redux.helper';
import type { RootState } from '@redux/store';
import { createSlice } from '@reduxjs/toolkit';
import {
  deleteParticipantFromOrderApi,
  loadBookerOrderDataApi,
  updateOrderDetailsApi,
} from '@utils/api';
import type { TObject, TUser } from '@utils/types';

// ================ Initial states ================ //
type TBookerOrderManagementState = {
  // Fetch data state
  isFetchingOrderDetails: boolean;
  // Delete state
  isDeletingParticipant: boolean;
  // Update state
  isUpdatingOrderDetails: boolean;
  // Data states
  companyId: string | null;
  orderData: TObject | null;
  planData: TObject;
  participantData: Array<TUser>;
};
const initialState: TBookerOrderManagementState = {
  isFetchingOrderDetails: false,
  isDeletingParticipant: false,
  isUpdatingOrderDetails: false,
  companyId: null,
  orderData: {},
  planData: {},
  participantData: [],
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

const updateOrderGeneralInfo = createAsyncThunk(
  'app/BookerOrderManagement/UPDATE_ORDER_GENERAL_INFO',
  async (params: TObject, { getState, dispatch }) => {
    const orderData = getState().BookerOrderManagement.orderData!;
    const {
      id: { uuid: orderId },
      attributes: { metadata },
    } = orderData;

    const updateParams = {
      data: {
        metadata: {
          ...metadata,
          generalInfo: {
            ...metadata.generalInfo,
            ...params,
          },
        },
      },
    };

    await updateOrderDetailsApi(orderId, updateParams);
    await dispatch(loadData(orderId));
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
  updateOrderGeneralInfo,
  deleteParticipant,
};

// ================ Slice ================ //
const BookerOrderManagementSlice = createSlice({
  name: 'BookerOrderManagement',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* =============== loadData =============== */
      .addCase(loadData.pending, (state) => {
        state.isFetchingOrderDetails = true;
      })
      .addCase(loadData.fulfilled, (state, { payload }) => {
        const {
          orderListing: orderData,
          planListing: planData,
          ...restPayload
        } = payload;

        return {
          ...state,
          isFetchingOrderDetails: false,
          orderData,
          planData,
          ...restPayload,
        };
      })
      .addCase(loadData.rejected, (state) => {
        state.isFetchingOrderDetails = false;
      })
      /* =============== deleteParticipant =============== */
      .addCase(deleteParticipant.pending, (state) => {
        state.isDeletingParticipant = true;
      })
      .addCase(deleteParticipant.fulfilled, (state) => {
        state.isDeletingParticipant = false;
      })
      .addCase(deleteParticipant.rejected, (state) => {
        state.isDeletingParticipant = false;
      })
      /* =============== updateOrderGeneralInfo =============== */
      .addCase(updateOrderGeneralInfo.pending, (state) => {
        state.isUpdatingOrderDetails = true;
      })
      .addCase(updateOrderGeneralInfo.fulfilled, (state) => {
        state.isUpdatingOrderDetails = false;
      })
      .addCase(updateOrderGeneralInfo.rejected, (state) => {
        state.isUpdatingOrderDetails = false;
      });
  },
});

// ================ Actions ================ //
export const BookerOrderManagementsAction = BookerOrderManagementSlice.actions;
export default BookerOrderManagementSlice.reducer;

// ================ Selectors ================ //
export const orderDetailsAnyActionsInProgress = (state: RootState) => {
  const {
    isFetchingOrderDetails: isFetchingOrderDetail,
    isDeletingParticipant,
    isUpdatingOrderDetails: isUpdatingOrderDetail,
  } = state.BookerOrderManagement;

  return (
    isFetchingOrderDetail || isDeletingParticipant || isUpdatingOrderDetail
  );
};
