import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import { denormalisedResponseEntities, Listing } from '@utils/data';
import type { TListing, TUser } from '@utils/types';

// ================ Initial states ================ //
type TBookerDraftOrderPageState = {
  companyAccount: TUser | null;
  fetchCompanyAccountInProgress: boolean;
  fetchCompanyAccountError: any;
};
const initialState: TBookerDraftOrderPageState = {
  companyAccount: null,
  fetchCompanyAccountInProgress: false,
  fetchCompanyAccountError: null,
};

// ================ Thunk types ================ //
const FETCH_COMPANY_FROM_ORDER =
  'app/BookerDraftOrderPage/FETCH_COMPANY_FROM_ORDER';

// ================ Async thunks ================ //
const fetchCompanyAccount = createAsyncThunk(
  FETCH_COMPANY_FROM_ORDER,
  async (_, { getState, extra: sdk }) => {
    const { order } = getState().Order;
    const { companyId } = Listing(order as TListing).getMetadata();
    const companyAccount = denormalisedResponseEntities(
      await sdk.users.show({
        id: companyId,
      }),
    )[0];

    return {
      companyAccount,
    };
  },
);

export const BookerDraftOrderPageThunks = {
  fetchCompanyAccount,
};

// ================ Slice ================ //
const BookerDraftOrderPageSlice = createSlice({
  name: 'BookerDraftOrderPage',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanyAccount.pending, (state) => {
        state.fetchCompanyAccountInProgress = true;
        state.fetchCompanyAccountError = null;
      })
      .addCase(fetchCompanyAccount.fulfilled, (state, action) => {
        state.companyAccount = action.payload.companyAccount;
        state.fetchCompanyAccountInProgress = false;
      })
      .addCase(fetchCompanyAccount.rejected, (state, { payload }) => {
        state.fetchCompanyAccountInProgress = false;
        state.fetchCompanyAccountError = payload;
      });
  },
});

// ================ Actions ================ //
export const BookerDraftOrderPageActions = BookerDraftOrderPageSlice.actions;
export default BookerDraftOrderPageSlice.reducer;

// ================ Selectors ================ //
