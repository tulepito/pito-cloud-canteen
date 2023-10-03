import { createSlice } from '@reduxjs/toolkit';
import differenceBy from 'lodash/differenceBy';

import { closePartnerMenuApi, publishPartnerMenuApi } from '@apis/menuApi';
import { deleteMenusApi } from '@apis/partnerApi';
import { queryAllPages } from '@helpers/apiHelpers';
import { createAsyncThunk } from '@redux/redux.helper';
import { CurrentUser, denormalisedResponseEntities } from '@src/utils/data';
import { EListingStates, EListingType, EOrderStates } from '@src/utils/enums';
import { storableError } from '@src/utils/errors';
import type { TCurrentUser, TListing, TObject } from '@src/utils/types';

// ================ Initial states ================ //
type TPartnerManageMenusState = {
  fetchMenusInProgress: boolean;
  fetchMenusError: any;
  menus: TListing[];
  // toggle menu active status
  toggleMenuActiveStatusInProgress: boolean;
  // delete menu
  preDeleteMenusInProgress: boolean;
  deleteMenusInProgress: boolean;
  // create/edit menu
  draftMenu: TObject;
  menu: TListing | null;
};
const initialState: TPartnerManageMenusState = {
  fetchMenusInProgress: false,
  fetchMenusError: null,
  menus: [],
  // toggle menu active status
  toggleMenuActiveStatusInProgress: false,
  // delete menu
  preDeleteMenusInProgress: false,
  deleteMenusInProgress: false,
  // create/edit menu
  draftMenu: {},
  menu: null,
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

const preDeleteMenus = createAsyncThunk(
  'app/PartnerManageMenus/PRE_DELETE_MENUS',
  async (
    payload: TObject,
    { extra: sdk, fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { id, ids } = payload;

      const idList = ids?.length > 0 ? ids : [id];

      const inProgressOrders = denormalisedResponseEntities(
        await sdk.listings.query({
          meta_menuIds: `has_any:${idList.join(',')}`,
          meta_listingType: EListingType.order,
          meta_orderState: `${EOrderStates.inProgress},${EOrderStates.picking}`,
        }),
      );

      return fulfillWithValue({ inProgressOrders });
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const deleteMenus = createAsyncThunk(
  'app/PartnerManageMenus/DELETE_MENUS',
  async (payload: TObject, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { id, ids } = payload;
      const idList = ids?.length > 0 ? ids : [id];

      await deleteMenusApi({ ids: idList });

      return fulfillWithValue(idList);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const PartnerManageMenusThunks = {
  loadData,
  toggleMenuActiveStatus,
  preDeleteMenus,
  deleteMenus,
};

// ================ Slice ================ //
const PartnerManageMenusSlice = createSlice({
  name: 'PartnerManageMenus',
  initialState,
  reducers: {
    saveDraft: (state, { payload }) => {
      state.draftMenu = payload;
    },
  },
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
      }) /* =============== deleteMenus =============== */
      .addCase(deleteMenus.pending, (state) => {
        state.deleteMenusInProgress = true;
      })
      .addCase(deleteMenus.fulfilled, (state, { payload }) => {
        const { ids } = payload;

        let newMenuList = state.menus;
        const fakeDeletedMenuList = ids.map((uuid: string) => ({
          id: {
            uuid,
          },
        }));

        newMenuList = differenceBy(newMenuList, fakeDeletedMenuList, 'id.uuid');

        state.menus = newMenuList;
        state.deleteMenusInProgress = false;
      })
      .addCase(deleteMenus.rejected, (state) => {
        state.deleteMenusInProgress = false;
      })
      /* =============== preDeleteMenus =============== */
      .addCase(preDeleteMenus.pending, (state) => {
        state.preDeleteMenusInProgress = true;
      })
      .addCase(preDeleteMenus.fulfilled, (state) => {
        state.preDeleteMenusInProgress = false;
      })
      .addCase(preDeleteMenus.rejected, (state) => {
        state.preDeleteMenusInProgress = false;
      });
  },
});

// ================ Actions ================ //
export const PartnerManageMenusActions = PartnerManageMenusSlice.actions;
export default PartnerManageMenusSlice.reducer;

// ================ Selectors ================ //
