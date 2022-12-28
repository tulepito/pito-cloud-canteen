import { createAsyncThunk } from '@reduxjs/toolkit';

import { loadOrderDataApi } from '../../utils/api';
import { storableError } from '../../utils/errors';
import type { ThunkAPI } from '../store';

const LOAD_DATA = 'app/OrderManagementPage/LOAD_DATA';
const loadData = createAsyncThunk(
  LOAD_DATA,
  async (orderId: string, { fulfillWithValue, rejectWithValue }: ThunkAPI) => {
    try {
      const { data } = await loadOrderDataApi(orderId);
    } catch (error: any) {
      console.error('Load data error');
      return rejectWithValue(storableError(error.response.data));
    }
  },
);
