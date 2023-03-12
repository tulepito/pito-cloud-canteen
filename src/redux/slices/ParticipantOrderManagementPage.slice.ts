import { createSlice } from '@reduxjs/toolkit';

import { loadOrderDataApi, updateParticipantOrderApi } from '@apis/index';
import { createAsyncThunk } from '@redux/redux.helper';
import { userThunks } from '@redux/slices/user.slice';
import { storableError } from '@utils/errors';
import type { TListing, TObject, TUser } from '@utils/types';

const LOAD_DATA = 'app/OrderManagementPage/LOAD_DATA';
const RELOAD_DATA = 'app/OrderManagementPage/RELOAD_DATA';
const UPDATE_ORDER = 'app/OrderManagementPage/UPDATE_ORDER';

type TParticipantOrderManagementState = {
  company: TUser | {};
  order: TListing | {};
  plans: TListing[];
  subOrders: any[];
  loadDataInProgress: boolean;
  loadDataError: any;
  // Update order
  updateOrderInProgress: boolean;
  updateOrderError: any;
};

const initialState: TParticipantOrderManagementState = {
  company: {},
  order: {},
  plans: [],
  subOrders: [],
  loadDataInProgress: false,
  loadDataError: null,

  // Update order
  updateOrderInProgress: false,
  updateOrderError: null,
};

const loadData = createAsyncThunk(
  LOAD_DATA,
  async (orderId: string, { dispatch }) => {
    const response = await loadOrderDataApi(orderId);
    await dispatch(userThunks.fetchCurrentUser({}));

    return response?.data.data;
  },
  {
    serializeError: storableError,
  },
);

const reloadData = createAsyncThunk(
  RELOAD_DATA,
  async (orderId: string, { dispatch }) => {
    const response = await loadOrderDataApi(orderId);
    await dispatch(userThunks.fetchCurrentUser({}));

    return response?.data.data;
  },
  {
    serializeError: storableError,
  },
);

const updateOrder = createAsyncThunk(
  UPDATE_ORDER,
  async (data: { orderId: string; updateValues: TObject }, { dispatch }) => {
    const { orderId, updateValues } = data;
    await updateParticipantOrderApi(orderId, updateValues);
    await dispatch(reloadData(orderId));
  },
  {
    serializeError: storableError,
  },
);

export const participantOrderManagementThunks = { loadData, updateOrder };

const participantOrderSlice = createSlice({
  name: 'ParticipantOrderManagement',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* =============== loadData =============== */
      .addCase(loadData.pending, (state) => ({
        ...state,
        loadDataInProgress: true,
        loadDataError: null,
      }))
      .addCase(loadData.fulfilled, (state, { payload }) => {
        return {
          ...state,
          ...payload,
          loadDataInProgress: false,
        };
      })
      .addCase(loadData.rejected, (state, { error }) => ({
        ...state,
        loadDataError: error.message,
        loadDataInProgress: false,
      }))
      .addCase(reloadData.pending, (state) => ({
        ...state,
        reloadDataInProgress: true,
        reloadDataError: null,
      }))
      .addCase(reloadData.fulfilled, (state, { payload }) => {
        return {
          ...state,
          ...payload,
          reloadDataInProgress: false,
        };
      })
      .addCase(reloadData.rejected, (state, { error }) => ({
        ...state,
        reloadDataError: error.message,
        reloadDataInProgress: false,
      }))
      .addCase(updateOrder.pending, (state) => ({
        ...state,
        updateOrderInProgress: true,
        updateOrderError: null,
      }))
      .addCase(updateOrder.fulfilled, (state) => ({
        ...state,
        updateOrderInProgress: false,
      }))
      .addCase(updateOrder.rejected, (state, { error }) => ({
        ...state,
        updateOrderInProgress: false,
        updateOrderError: error.message,
      }));
  },
});

export default participantOrderSlice.reducer;
