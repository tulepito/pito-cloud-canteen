import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import { storableError } from '@utils/errors';

import { loadOrderDataApi } from '../../utils/api';

const LOAD_DATA = 'app/OrderManagementPage/LOAD_DATA';

const initialState: any = {
  restaurant: {},
  company: {},
  order: {},
  loadDataInProgress: false,
  loadDataError: null,
};

const loadData = createAsyncThunk(
  LOAD_DATA,
  async (orderId: string) => {
    const response = await loadOrderDataApi(orderId);
    return response?.data.data;
  },
  {
    serializeError: storableError,
  },
);

export const ParticipantOrderAsyncAction = { loadData };

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
      }));
  },
});

export default participantOrderSlice.reducer;
