import { createSlice } from '@reduxjs/toolkit';

import { fetchSearchFilterApi } from '@apis/userApi';
import { createAsyncThunk } from '@redux/redux.helper';
import { denormalisedResponseEntities, Listing } from '@utils/data';
import type { TKeyValue, TListing, TUser } from '@utils/types';

// ================ Initial states ================ //
type TBookerDraftOrderPageState = {
  companyAccount: TUser | null;
  fetchCompanyAccountInProgress: boolean;
  fetchCompanyAccountError: any;
  selectedCalendarDate: Date;

  menuTypes: TKeyValue[];
  categories: TKeyValue[];
  packaging: TKeyValue[];
  nutritions: TKeyValue[];

  fetchAttributesInProgress: boolean;
  fetchAttributesError: any;
};
const initialState: TBookerDraftOrderPageState = {
  companyAccount: null,
  fetchCompanyAccountInProgress: false,
  fetchCompanyAccountError: null,
  selectedCalendarDate: undefined!,
  menuTypes: [],
  categories: [],
  packaging: [],
  nutritions: [],

  fetchAttributesInProgress: false,
  fetchAttributesError: null,
};

// ================ Thunk types ================ //
const FETCH_COMPANY_FROM_ORDER =
  'app/BookerDraftOrderPage/FETCH_COMPANY_FROM_ORDER';
const FETCH_ATTRIBUTES = 'app/BookerDraftOrderPage/FETCH_ATTRIBUTES';

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

const fetchAttributes = createAsyncThunk(FETCH_ATTRIBUTES, async () => {
  const { data: response } = await fetchSearchFilterApi();

  return response;
});

export const BookerDraftOrderPageThunks = {
  fetchCompanyAccount,
  fetchAttributes,
};

// ================ Slice ================ //
const BookerDraftOrderPageSlice = createSlice({
  name: 'BookerDraftOrderPage',
  initialState,
  reducers: {
    selectCalendarDate: (state, { payload }) => ({
      ...state,
      selectedCalendarDate: payload,
    }),
  },
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
      })

      .addCase(fetchAttributes.pending, (state) => {
        return {
          ...state,
          fetchAttributesInProgress: true,
          fetchAttributesError: null,
        };
      })
      .addCase(fetchAttributes.fulfilled, (state, { payload }) => {
        return {
          ...state,
          fetchAttributesInProgress: false,
          menuTypes: payload?.menuTypes,
          packaging: payload?.packaging,
          categories: payload?.categories,
          nutritions: payload?.nutritions,
        };
      })
      .addCase(fetchAttributes.rejected, (state, { error }) => {
        return {
          ...state,
          fetchAttributesInProgress: false,
          fetchAttributesError: error.message,
        };
      });
  },
});

// ================ Actions ================ //
export const BookerDraftOrderPageActions = BookerDraftOrderPageSlice.actions;
export default BookerDraftOrderPageSlice.reducer;

// ================ Selectors ================ //
