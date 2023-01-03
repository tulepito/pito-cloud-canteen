import { createAsyncThunk } from '@redux/redux.helper';
import { userThunks } from '@redux/slices/user.slice';
import { createSlice } from '@reduxjs/toolkit';
import { storableError } from '@utils/errors';

import { loadOrderDataApi, updateParticipantOrderApi } from '../../utils/api';

const LOAD_DATA = 'app/OrderManagementPage/LOAD_DATA';
const UPDATE_ORDER = 'app/OrderManagementPage/UPDATE_ORDER';

const initialState: any = {
  company: {},
  order: {},
  plans: {},
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

const updateOrder = createAsyncThunk(
  UPDATE_ORDER,
  async (data: { orderId: string; updateValues: any }, { dispatch }) => {
    const { orderId, updateValues } = data;
    await updateParticipantOrderApi(orderId, updateValues);
    await dispatch(loadData(orderId));
  },
  {
    serializeError: storableError,
  },
);

export const ParticipantOrderAsyncAction = { loadData, updateOrder };

const participantOrderSlice = createSlice({
  name: 'ParticipantOrderManagement',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
