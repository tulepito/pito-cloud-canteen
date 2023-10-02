import { createSlice } from '@reduxjs/toolkit';

import { closePartnerMenuApi, publishPartnerMenuApi } from '@apis/menuApi';
import { queryAllPages } from '@helpers/apiHelpers';
import { createAsyncThunk } from '@redux/redux.helper';
import { CurrentUser, denormalisedResponseEntities } from '@src/utils/data';
import { EListingStates, EListingType } from '@src/utils/enums';
import { storableError } from '@src/utils/errors';
import type { TCurrentUser, TListing, TObject } from '@src/utils/types';

// ================ Initial states ================ //
type TPartnerManageMenusState = {
  fetchMenusInProgress: boolean;
  fetchMenusError: any;
  menus: TListing[];
  // toggle menu active status
  toggleMenuActiveStatusInProgress: boolean;
};
const initialState: TPartnerManageMenusState = {
  fetchMenusInProgress: false,
  fetchMenusError: null,
  menus: [],
  // toggle menu active status
  toggleMenuActiveStatusInProgress: false,
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

const toggleMenuActiveStatus = createAsyncThunk(
  'app/PartnerManageMenus/TOGGLE_MENU_ACTIVE_STATUS',
  async (payload: TObject, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { id, newListingState } = payload;

      const { data } =
        newListingState === EListingStates.published
          ? await publishPartnerMenuApi(id)
          : await closePartnerMenuApi(id);

      return fulfillWithValue({
        id,
        listing: denormalisedResponseEntities(data)[0],
      });
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const PartnerManageMenusThunks = {
  loadData,
  toggleMenuActiveStatus,
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
      })
      /* =============== toggleMenuActiveStatus =============== */
      .addCase(toggleMenuActiveStatus.pending, (state) => {
        state.toggleMenuActiveStatusInProgress = true;
      })
      .addCase(toggleMenuActiveStatus.fulfilled, (state, { payload }) => {
        const { id, listing } = payload || {};
        const currMenuList = state.menus;
        const menuIndexMaybe = currMenuList.findIndex((m) => m.id.uuid === id);

        if (menuIndexMaybe > -1) {
          currMenuList[menuIndexMaybe] = listing;
        }

        state.toggleMenuActiveStatusInProgress = false;
        state.menus = currMenuList;
      })
      .addCase(toggleMenuActiveStatus.rejected, (state) => {
        state.toggleMenuActiveStatusInProgress = false;
      });
  },
});

// ================ Actions ================ //
export const PartnerManageMenusActions = PartnerManageMenusSlice.actions;
export default PartnerManageMenusSlice.reducer;

// ================ Selectors ================ //
