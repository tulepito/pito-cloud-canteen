import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import { createCompanyApi } from '@utils/api';
import { storableError } from '@utils/errors';

type CreateCompanyState = {
  createCompanyInProgress: boolean;
  createCompanyError: any;
};

const CREATE_COMPANY = 'app/CreateCompanyPage/CREATE_COMPANY';

const createCompany = createAsyncThunk(
  CREATE_COMPANY,
  async (userData: any, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await createCompanyApi(userData);
      return fulfillWithValue(data);
    } catch (error: any) {
      console.log(error);
      return rejectWithValue(storableError(error.response.data));
    }
  },
);

export const createCompanyPageThunks = {
  createCompany,
};

const initialState: CreateCompanyState = {
  createCompanyInProgress: false,
  createCompanyError: null,
};

export const createCompanySlice = createSlice({
  name: 'CreateCompanyPage',
  initialState,
  reducers: {
    clearError: (state) => ({
      ...state,
      createCompanyError: null,
    }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(createCompany.pending, (state) => ({
        ...state,
        createCompanyInProgress: true,
        createCompanyError: null,
      }))
      .addCase(createCompany.fulfilled, (state) => ({
        ...state,
        createCompanyInProgress: false,
      }))
      .addCase(createCompany.rejected, (state, action) => ({
        ...state,
        createCompanyInProgress: false,
        createCompanyError: action.payload,
      }));
  },
});

export const { clearError } = createCompanySlice.actions;

export default createCompanySlice.reducer;
