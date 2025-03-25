import { createSlice } from '@reduxjs/toolkit';

import { createAsyncThunk } from '@redux/redux.helper';
import type { PlanListing, WithFlexSDKData } from '@src/types';

// ================ Initial states ================ //
type TScannerState = {
  planListing: PlanListing | null;
  planListingInProgress: boolean;
  planListingError: string;
};
const initialState: TScannerState = {
  planListing: null,
  planListingInProgress: false,
  planListingError: '',
};

// ================ Thunk types ================ //
const SCANNER_PLAN_LISTING = 'app/scanner/SCANNER_PLAN_LISTING';

// ================ Async thunks ================ //

export const ScannerThunks = {
  fetchPlanListing: createAsyncThunk(
    SCANNER_PLAN_LISTING,
    async (
      payload: { planId: string },
      { extra: sdk, fulfillWithValue, rejectWithValue },
    ) => {
      try {
        const planData: WithFlexSDKData<PlanListing> = await sdk.listings.show({
          id: payload.planId,
        });

        return fulfillWithValue(planData.data.data);
      } catch (error) {
        return rejectWithValue(error);
      }
    },
  ),
};

export const getErrorStringFromErrorObject = (error: any) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error.message ||
    'Unknown error'
  );
};

// ================ Slice ================ //
const ScannerSlice = createSlice({
  name: 'Scanner',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(ScannerThunks.fetchPlanListing.fulfilled, (state, action) => {
        state.planListing = action.payload;
        state.planListingInProgress = false;
      })
      .addCase(ScannerThunks.fetchPlanListing.rejected, (state, action) => {
        state.planListingInProgress = false;
        state.planListingError = getErrorStringFromErrorObject(action.payload);
      })
      .addCase(ScannerThunks.fetchPlanListing.pending, (state) => {
        state.planListingInProgress = true;
        state.planListingError = '';
      });
  },
});

// ================ Actions ================ //
export const ScannerActions = ScannerSlice.actions;
export default ScannerSlice.reducer;

// ================ Selectors ================ //
