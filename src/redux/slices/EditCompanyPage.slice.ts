import type { ThunkAPI } from '@redux/store';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { showCompanyApi, updateCompanyApi } from '@utils/api';
import { denormalisedResponseEntities } from '@utils/data';
import { storableError } from '@utils/errors';

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
  async (userData: any, { fulfillWithValue, rejectWithValue }: ThunkAPI) => {
    try {
      const { data } = await updateCompanyApi(userData);
      const [company] = denormalisedResponseEntities(data);
      return fulfillWithValue(company);
    } catch (error: any) {
      console.error('update company error', error);
      return rejectWithValue(storableError(error.response.data));
    }
  },
);

const showCompany = createAsyncThunk(
  SHOW_COMPANY,
  async (id: string, { fulfillWithValue, rejectWithValue }: ThunkAPI) => {
    try {
      const { data } = await showCompanyApi(id);
      const [company] = denormalisedResponseEntities(data);
      return fulfillWithValue(company);
    } catch (error: any) {
      console.error('show company error', error);
      return rejectWithValue(storableError(error.response.data));
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
  reducers: {
    clearError: (state) => ({
      ...state,
      updateCompanyError: null,
      showCompanyError: null,
    }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateCompany.pending, (state) => ({
        ...state,
        updateCompanyInProgress: true,
        updateCompanyError: null,
      }))
      .addCase(updateCompany.fulfilled, (state, action) => ({
        ...state,
        updateCompanyInProgress: false,
        companyRef: action.payload,
      }))
      .addCase(updateCompany.rejected, (state, action) => ({
        ...state,
        updateCompanyInProgress: false,
        updateCompanyError: action.payload,
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
          companyRef: action.payload,
          showCompanyInProgress: false,
        };
      })
      .addCase(showCompany.rejected, (state, action) => {
        return {
          ...state,
          showCompanyInProgress: false,
          showCompanyError: action.payload,
        };
      });
  },
});

export const { clearError } = editCompanySlice.actions;

export default editCompanySlice.reducer;
