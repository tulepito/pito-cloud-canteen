import { createSlice } from '@reduxjs/toolkit';

// ================ Initial states ================ //
type TPriceQuotationState = {
  isDownloading: boolean;
};
const initialState: TPriceQuotationState = {
  isDownloading: false,
};

// ================ Thunk types ================ //

// ================ Async thunks ================ //
export const priceQuotationThunks = {};

// ================ Slice ================ //
const priceQuotationSlice = createSlice({
  name: 'priceQuotation',
  initialState,
  reducers: {
    startDownloading: (state) => {
      state.isDownloading = true;
    },
    endDownloading: (state) => {
      state.isDownloading = false;
    },
  },
  extraReducers: () => {},
});

// ================ Actions ================ //
export const priceQuotationActions = priceQuotationSlice.actions;
export default priceQuotationSlice.reducer;

// ================ Selectors ================ //
