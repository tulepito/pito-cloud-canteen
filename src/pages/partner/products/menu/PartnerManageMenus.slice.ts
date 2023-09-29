import { createSlice } from '@reduxjs/toolkit';

import { queryAllPages } from '@helpers/apiHelpers';
import { createAsyncThunk } from '@redux/redux.helper';
import { CurrentUser } from '@src/utils/data';
import { EListingType } from '@src/utils/enums';
import { storableError } from '@src/utils/errors';
import type { TCurrentUser, TListing, TObject } from '@src/utils/types';

// ================ Initial states ================ //
type TPartnerManageMenusState = {
  fetchMenusInProgress: boolean;
  fetchMenusError: any;
  menus: TListing[];
};
const initialState: TPartnerManageMenusState = {
  fetchMenusInProgress: false,
  fetchMenusError: null,
  menus: [],
};

// ================ Thunk types ================ //

// ================ Async thunks ================ //
const loadData = createAsyncThunk(
  'app/PartnerManageMenus/LOAD_DATA',
  async (payload: TObject, { extra: sdk, getState, rejectWithValue }) => {
    try {
      const { currentUser } = getState().user;
      const { restaurantListingId } = CurrentUser(
        currentUser as TCurrentUser,
      ).getMetadata();

      const menus = await queryAllPages({
        sdkModel: sdk.listings,
        query: {
          meta_listingType: EListingType.menu,
          meta_restaurantId: restaurantListingId,
          meta_isDeleted: false,
          ...payload,
        },
      });

      return menus;
    } catch (error) {
      return rejectWithValue(storableError(error));
    }
  },
);

export const PartnerManageMenusThunks = {
  loadData,
};

// ================ Slice ================ //
const PartnerManageMenusSlice = createSlice({
  name: 'PartnerManageMenus',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* =============== loadData =============== */
      .addCase(loadData.pending, (state) => {
        state.fetchMenusInProgress = true;
        state.fetchMenusError = null;
      })
      .addCase(loadData.fulfilled, (state, { payload }) => {
        state.fetchMenusInProgress = false;
        state.menus = payload;
      })
      .addCase(loadData.rejected, (state, { error }) => {
        state.fetchMenusInProgress = false;
        state.fetchMenusError = error.message;
      });
  },
});

// ================ Actions ================ //
export const PartnerManageMenusActions = PartnerManageMenusSlice.actions;
export default PartnerManageMenusSlice.reducer;

// ================ Selectors ================ //
