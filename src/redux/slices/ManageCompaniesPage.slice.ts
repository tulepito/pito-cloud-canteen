/* eslint-disable import/no-cycle */

import type { ThunkAPI } from '@redux/store';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getCompaniesApi, updateCompanyStatusApi } from '@utils/api';
import { denormalisedResponseEntities } from '@utils/data';
import { storableError } from '@utils/errors';
import type { TCompany, TPagination } from '@utils/types';

export const RESULT_PAGE_SIZE = 10;

interface ManageCompanyState {
  companyRefs: any[];
  queryCompaniesInProgress: boolean;
  queryCompaniesError: any;
  pagination?: TPagination | null;
  updateStatusInProgress: boolean;
  updateStatusError: any;
}

const QUERY_COMPANIES = 'app/ManageCompanies/QUERY_COMPANIES';
const UPDATE_COMPANY_STATUS = 'app/ManageCompanies/UPDATE_COMPANY_STATUS';

const queryCompanies = createAsyncThunk(
  QUERY_COMPANIES,
  async (page: number, { fulfillWithValue, rejectWithValue }: ThunkAPI) => {
    try {
      const { data } = await getCompaniesApi();
      const { meta: pagination } = data.data;
      const companies = denormalisedResponseEntities(data);
      return fulfillWithValue({ companies, page, data, pagination });
    } catch (error: any) {
      console.error('Query company error : ', error);
      return rejectWithValue(storableError(error.response.data));
    }
  },
);

const updateCompanyStatus = createAsyncThunk(
  UPDATE_COMPANY_STATUS,
  async (updateData: any, { fulfillWithValue, rejectWithValue }: ThunkAPI) => {
    try {
      const { data } = await updateCompanyStatusApi(updateData);
      const [company] = denormalisedResponseEntities(data);
      return fulfillWithValue(company);
    } catch (error: any) {
      console.error('Update company status error : ', error);
      return rejectWithValue(storableError(error.response.data));
    }
  },
);

export const manageCompaniesThunks = {
  queryCompanies,
  updateCompanyStatus,
};

const initialState: ManageCompanyState = {
  companyRefs: [],
  queryCompaniesInProgress: false,
  queryCompaniesError: true,
  updateStatusInProgress: false,
  updateStatusError: null,
  pagination: null,
};

export const manageCompaniesSlice = createSlice({
  name: 'ManageCompaniesPage',
  initialState,
  reducers: {
    paginateCompanies: (state, action) => {
      const { page, totalItems } = action.payload;
      return {
        ...state,
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / RESULT_PAGE_SIZE),
          perPage: RESULT_PAGE_SIZE,
          page,
        },
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(queryCompanies.pending, (state) => ({
        ...state,
        queryCompaniesInProgress: true,
        queryCompaniesError: null,
      }))
      .addCase(queryCompanies.fulfilled, (state, action) => {
        const {
          companies,
          pagination: { totalItems },
          page,
        } = action.payload;
        return {
          ...state,
          companyRefs: companies,
          queryCompaniesInProgress: false,
          pagination: {
            totalItems,
            totalPages: Math.ceil(totalItems / RESULT_PAGE_SIZE),
            perPage: RESULT_PAGE_SIZE,
            page,
          },
        };
      })
      .addCase(queryCompanies.rejected, (state, action) => ({
        ...state,
        queryCompaniesError: action.payload,
        queryCompaniesInProgress: false,
      }))
      .addCase(updateCompanyStatus.pending, (state) => ({
        ...state,
        updateStatusInProgress: true,
        updateStatusError: null,
      }))
      .addCase(updateCompanyStatus.fulfilled, (state, action) => {
        const { companyRefs } = state;
        const companies = [...companyRefs];
        const newCompany = action.payload;
        const index = companyRefs.findIndex((company: TCompany) => {
          return company.id.uuid === newCompany.id.uuid;
        });
        companies[index] = newCompany;
        return {
          ...state,
          companyRefs: companies,
          updateStatusInProgress: false,
        };
      })
      .addCase(updateCompanyStatus.rejected, (state, action) => ({
        ...state,
        updateStatusInProgress: false,
        updateStatusError: action.payload,
      }));
  },
});

export const { paginateCompanies } = manageCompaniesSlice.actions;

export default manageCompaniesSlice.reducer;
