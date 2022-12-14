import type { ThunkAPI } from '@redux/store';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { showCompanyApi, updateCompanyApi } from '@utils/api';
import { entityRefs } from '@utils/data';
import { storableError } from '@utils/errors';

import { addMarketplaceEntities } from './marketplaceData.slice';

interface EditCompanyState {
  companyRef: any;
  showCompanyInProgress: boolean;
  showCompanyError: any;
  updateCompanyInProgress: boolean;
  updateCompanyError: any;
}

const UPDATE_COMPANY = 'app/UpdateCompanyPage/UPDATE_COMPANY';
const SHOW_COMPANY = 'app/UpdateCompanyPage/SHOW_COMPANY';

const updateCompany = createAsyncThunk(
  UPDATE_COMPANY,
  async (
    userData: any,
    { dispatch, fulfillWithValue, rejectWithValue }: ThunkAPi,
  ) => {
    try {
      const { data } = await updateCompanyApi(userData);
      dispatch(addMarketplaceEntities(data));
      return fulfillWithValue(data);
    } catch (error) {
      console.error('update company error', error);
      return rejectWithValue(storableError(error));
    }
  },
);

const showCompany = createAsyncThunk(
  SHOW_COMPANY,
  async (
    id: string,
    { dispatch, fulfillWithValue, rejectWithValue }: ThunkAPI,
  ) => {
    try {
      const { data } = await showCompanyApi(id);
      dispatch(addMarketplaceEntities(data));
      return fulfillWithValue(data);
    } catch (error) {
      console.error('show company error', error);
      return rejectWithValue(storableError(error));
    }
  },
);

export const updateCompanyPageThunks = {
  updateCompany,
  showCompany,
};

const initialState: EditCompanyState = {
  companyRef: null,
  updateCompanyInProgress: false,
  updateCompanyError: null,
  showCompanyInProgress: false,
  showCompanyError: null,
};

export const editCompanySlice = createSlice({
  name: 'EditCompanyPage',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(updateCompany.pending, (state) => ({
        ...state,
        updateCompanyInProgress: true,
        updateCompanyError: null,
      }))
      .addCase(updateCompany.fulfilled, (state) => ({
        ...state,
        updateCompanyInProgress: false,
      }))
      .addCase(updateCompany.rejected, (state, action) => ({
        ...state,
        updateCompanyInProgress: false,
        updateCompanyError: action.error.message,
      }))
      .addCase(showCompany.pending, (state) => {
        return {
          ...state,
          showCompanyInProgress: true,
          showCompanyError: null,
        };
      })
      .addCase(showCompany.fulfilled, (state, action) => {
        return {
          ...state,
          companyRef: entityRefs([action.payload.data.data]),
          showCompanyInProgress: false,
        };
      })
      .addCase(showCompany.rejected, (state, action) => {
        return {
          ...state,
          showCompanyInProgress: false,
          showCompanyError: action.error.message,
        };
      });
  },
});

export default editCompanySlice.reducer;
