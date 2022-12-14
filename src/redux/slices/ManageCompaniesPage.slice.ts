/* eslint-disable import/no-cycle */

import type { ThunkAPI } from '@redux/store';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getCompaniesApi } from '@utils/api';
import { entityRefs } from '@utils/data';
import { storableError } from '@utils/errors';
import type { TPagination } from '@utils/types';

import { addMarketplaceEntities } from './marketplaceData.slice';

const RESULT_PAGE_SIZE = 10;

interface ManageCompanyState {
  companyRefs: any[];
  queryCompaniesInProgress: boolean;
  queryCompaniesError: any;
  pagination: TPagination;
}

const QUERY_COMPANIES = 'app/ManageCompanies/QUERY_COMPANIES';

const queryCompanies = createAsyncThunk(
  QUERY_COMPANIES,
  async (
    page: number,
    { dispatch, fulfillWithValue, rejectWithValue }: ThunkAPI,
  ) => {
    try {
      const { data } = await getCompaniesApi();
      dispatch(addMarketplaceEntities(data));
      return fulfillWithValue({ data, page });
    } catch (error) {
      return rejectWithValue(storableError(error));
    }
  },
);

export const manageCompaniesThunks = {
  queryCompanies,
};

const initialState: ManageCompanyState = {
  companyRefs: [],
  queryCompaniesInProgress: false,
  queryCompaniesError: true,
  pagination: {
    totalItems: 0,
    totalPages: 0,
    page: 0,
    perPage: 0,
  },
};

export const manageCompaniesSlice = createSlice({
  name: 'ManageCompaniesPage',
  initialState,
  reducers: {
    paginateCompanies: (state, action) => {
      return {
        ...state,
        pagination: {
          ...state.pagination,
          page: action.payload,
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
        const { data, page } = action.payload;
        const { totalItems } = data.data.meta;
        return {
          ...state,
          companyRefs: entityRefs(data.data.data),
          queryCompaniesInProgress: false,
          pagination: {
            totalItems,
            totalPages: Math.ceil(totalItems / RESULT_PAGE_SIZE),
            page,
            perPage: RESULT_PAGE_SIZE,
          },
        };
      })
      .addCase(queryCompanies.rejected, (state, action) => ({
        ...state,
        queryCompaniesError: action.error.message,
        queryCompaniesInProgress: false,
      }));
  },
});

export const { paginateCompanies } = manageCompaniesSlice.actions;

export default manageCompaniesSlice.reducer;
