import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createCompanyApi } from '@utils/api';
import { storableError } from '@utils/errors';

import { addMarketplaceEntities } from './marketplaceData.slice';

interface CreateCompanyState {
  createCompanyInProgress: boolean;
  createCompanyError: any;
}

const CREATE_COMPANY = 'app/CreateCompanyPage/CREATE_COMPANY';

const creatCompany = createAsyncThunk(
  CREATE_COMPANY,
  async (
    userData: any,
    { dispatch, fulfillWithValue, rejectWithValue }: ThunkAPI,
  ) => {
    try {
      const { data } = await createCompanyApi(userData);
      dispatch(addMarketplaceEntities(data));
      return fulfillWithValue(data);
    } catch (error: any) {
      console.log(error);
      return rejectWithValue(storableError(error.response.data));
    }
  },
);

export const createCompanyPageThunks = {
  creatCompany,
};

const initialState: CreateCompanyState = {
  createCompanyInProgress: false,
  createCompanyError: null,
};

export const editCompanySlice = createSlice({
  name: 'CreateCompanyPage',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(creatCompany.pending, (state) => ({
        ...state,
        createCompanyInProgress: true,
        createCompanyError: null,
      }))
      .addCase(creatCompany.fulfilled, (state) => ({
        ...state,
        createCompanyInProgress: false,
      }))
      .addCase(creatCompany.rejected, (state, action) => ({
        ...state,
        createCompanyInProgress: false,
        createCompanyError: action.payload,
      }));
  },
});

export default editCompanySlice.reducer;
