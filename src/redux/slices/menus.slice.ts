import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import { denormalisedResponseEntities } from '@utils/data';
import { EListingType } from '@utils/enums';
import { storableError } from '@utils/errors';
import type { TListing, TPagination } from '@utils/types';

export const MANAGE_MENU_PAGE_SIZE = 10;

// ================ Initial states ================ //
type TMenusSliceState = {
  menus: TListing[];
  queryMenusInProgress: boolean;
  queryMenusError: any;
  manageMenusPagination: TPagination | null;
};
const initialState: TMenusSliceState = {
  menus: [],
  queryMenusInProgress: false,
  queryMenusError: null,
  manageMenusPagination: null,
};

// ================ Thunk types ================ //

const QUERY_PARTNER_MENUS = 'app/ManageFoodsPage/QUERY_PARTNER_MENUS';

// ================ Async thunks ================ //

const queryPartnerMenus = createAsyncThunk(
  QUERY_PARTNER_MENUS,
  async (payload: any, { extra: sdk }) => {
    const { restaurantId, menuType } = payload;
    const response = await sdk.listings.query({
      meta_menuType: menuType,
      meta_listingType: EListingType.menu,
      meta_restaurantId: restaurantId,
      meta_isDeleted: false,
      perPage: MANAGE_MENU_PAGE_SIZE,
    });
    const menus = denormalisedResponseEntities(response);
    return { menus, pagination: response.data.meta };
  },
  {
    serializeError: storableError,
  },
);

export const menusSliceThunks = {
  queryPartnerMenus,
};

// ================ Slice ================ //
const menusSliceSlice = createSlice({
  name: 'menusSlice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(queryPartnerMenus.pending, (state) => ({
        ...state,
        queryMenusInProgress: true,
        queryMenusError: null,
      }))
      .addCase(queryPartnerMenus.fulfilled, (state, { payload }) => ({
        ...state,
        menus: payload.menus,
        manageMenusPagination: payload.pagination,
      }));
  },
});

// ================ Actions ================ //
export const menusSliceAction = menusSliceSlice.actions;
export default menusSliceSlice.reducer;

// ================ Selectors ================ //
