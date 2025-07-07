import { createSlice } from '@reduxjs/toolkit';

import { getParticipantsByOrderApi } from '@apis/orderApi';
import { createAsyncThunk } from '@redux/redux.helper';
import type { PlanListing, WithFlexSDKData } from '@src/types';
import type { TCompany, TUser } from '@src/utils/types';

// ================ Initial states ================ //
type TScannerState = {
  planListing: PlanListing | null;
  planListingInProgress: boolean;
  planListingError: string;
  participantData: Array<TUser>;
  anonymousParticipantData: Array<TUser>;
  fetchOrderInProgress: boolean;
  companyData: TCompany | null;
};
const initialState: TScannerState = {
  planListing: null,
  planListingInProgress: false,
  planListingError: '',
  participantData: [],
  anonymousParticipantData: [],
  fetchOrderInProgress: false,
  companyData: null,
};

// ================ Thunk types ================ //
const SCANNER_PLAN_LISTING = 'app/scanner/SCANNER_PLAN_LISTING';
const LOAD_DATA = "app/scanner/LOAD_DATA'";

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
  loadData: createAsyncThunk(
    LOAD_DATA,
    async (payload: { orderId: string }) => {
      const { orderId } = payload;
      const response: any = await getParticipantsByOrderApi(orderId);

      return response.data;
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
      })
      .addCase(ScannerThunks.loadData.pending, (state) => {
        state.fetchOrderInProgress = true;
      })
      .addCase(ScannerThunks.loadData.fulfilled, (state, { payload }) => {
        return {
          ...state,
          participantData: payload.participantData || [],
          anonymousParticipantData: payload.anonymousParticipantData || [],
          companyData: payload.company || null,
          fetchOrderInProgress: false,
        };
      })
      .addCase(ScannerThunks.loadData.rejected, (state) => {
        state.fetchOrderInProgress = false;
      });
  },
});

// ================ Actions ================ //
export const ScannerActions = ScannerSlice.actions;
export default ScannerSlice.reducer;

// ================ Selectors ================ //
