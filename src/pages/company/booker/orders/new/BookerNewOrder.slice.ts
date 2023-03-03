import { createSlice } from '@reduxjs/toolkit';

import { queryMyCompaniesApi } from '@apis/userApi';
import { createAsyncThunk } from '@redux/redux.helper';
import { storableError } from '@utils/errors';

// ================ Initial states ================ //
type TBookerNewOrderState = {
  queryInprogress: boolean;
  queryError?: any;
  myCompanies: any[];
};
const initialState: TBookerNewOrderState = {
  queryInprogress: false,
  queryError: null,
  myCompanies: [],
};

// ================ Thunk types ================ //
const QUERY_MY_COMPANIES = 'app/bookerNewOrder/queryMyCompanies';

// ================ Async thunks ================ //
const queryMyCompanies = createAsyncThunk(
  QUERY_MY_COMPANIES,
  async (_) => {
    // call api
    const companyList = await queryMyCompaniesApi();
    return companyList.data;
  },
  {
    serializeError: storableError,
  },
);

export const BookerNewOrderThunks = { queryMyCompanies };

// ================ Slice ================ //
const BookerNewOrderSlice = createSlice({
  name: 'BookerNewOrder',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(queryMyCompanies.pending, (state) => {
        return {
          ...state,
          queryInprogress: true,
          queryError: null,
        };
      })
      .addCase(queryMyCompanies.fulfilled, (state, { payload }) => {
        return {
          ...state,
          queryInprogress: false,
          myCompanies: payload,
        };
      })
      .addCase(queryMyCompanies.rejected, (state, { error }) => {
        return {
          ...state,
          queryInprogress: false,
          queryError: error,
        };
      });
  },
});

// ================ Actions ================ //
export const BookerNewOrderAction = BookerNewOrderSlice.actions;
export default BookerNewOrderSlice.reducer;

// ================ Selectors ================ //
