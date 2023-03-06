import { createSlice } from '@reduxjs/toolkit';

import { getCompaniesApi } from '@apis/index';
import { createAsyncThunk } from '@redux/redux.helper';
import type { TUser } from '@src/utils/types';

// ================ Initial states ================ //
type TBookerCompaniesState = {
  companies: TUser[];
};
const initialState: TBookerCompaniesState = {
  companies: [],
};

// ================ Thunk types ================ //
const FETCH_BOOKER_COMPANIES = 'app/BookerCompanies/FETCH_BOOKER_COMPANIES';

// ================ Async thunks ================ //
const fetchBookerCompanies = createAsyncThunk(
  FETCH_BOOKER_COMPANIES,
  async () => {
    const { data: response } = await getCompaniesApi();

    return response;
  },
);

export const BookerCompaniesThunks = { fetchBookerCompanies };

// ================ Slice ================ //
const BookerCompaniesSlice = createSlice({
  name: 'BookerCompanies',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchBookerCompanies.fulfilled, (state, action) => {
      state.companies = action.payload;
    });
  },
});

// ================ Actions ================ //
export const BookerCompaniesActions = BookerCompaniesSlice.actions;
export default BookerCompaniesSlice.reducer;

// ================ Selectors ================ //
