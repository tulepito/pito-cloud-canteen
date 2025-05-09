import { createSlice } from '@reduxjs/toolkit';
import { uniqBy } from 'lodash';
import differenceBy from 'lodash/differenceBy';
import isEqual from 'lodash/isEqual';
import * as xlsx from 'xlsx';

import { changeMenuEndDateInBulkApi } from '@apis/admin';
import { closePartnerMenuApi, publishPartnerMenuApi } from '@apis/menuApi';
import {
  createDraftMenuApi,
  deleteMenusApi,
  getMenuApi,
  publishDraftMenuApi,
  updateMenuApi,
} from '@apis/partnerApi';
import { queryAllPages } from '@helpers/apiHelpers';
import type { ToolType } from '@pages/api/admin/listings/menus/change-end-date-in-bulk.api';
import { createAsyncThunk } from '@redux/redux.helper';
import { foodSliceThunks } from '@redux/slices/foods.slice';
import {
  CurrentUser,
  denormalisedResponseEntities,
  IntegrationMenuListing,
  Listing,
} from '@src/utils/data';
import {
  EListingStates,
  EListingType,
  EMenuType,
  EOrderStates,
} from '@src/utils/enums';
import { storableAxiosError, storableError } from '@src/utils/errors';
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
  loadMenuDataInProgress: boolean;
  createDraftMenuInProgress: boolean;
  createDraftMenuError: any;
  updateDraftMenuInProgress: boolean;
  updateDraftMenuError: any;
  publishDraftMenuInProgress: boolean;
  publishDraftMenuError: any;
  pickedFood: any[];
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
  loadMenuDataInProgress: false,
  createDraftMenuInProgress: false,
  createDraftMenuError: null,
  updateDraftMenuInProgress: false,
  updateDraftMenuError: null,
  publishDraftMenuInProgress: false,
  publishDraftMenuError: null,
  pickedFood: [],
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

const loadMenuData = createAsyncThunk(
  'app/PartnerManageMenus/LOAD_MENU_DATA',
  async (
    payload: TObject,
    { getState, dispatch, fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { menuId } = payload;
      const { currentUser } = getState().user;

      const { restaurantListingId } = CurrentUser(currentUser!).getMetadata();

      const response = await getMenuApi(menuId);
      const menu = response.data;

      const { payload: queryFoodPayload, error } = (await dispatch(
        foodSliceThunks.queryMenuPickedFoods({
          restaurantId: restaurantListingId,
          ids: IntegrationMenuListing(response.data).getListFoodIds(),
        }),
      )) as any;

      return fulfillWithValue({
        menu,
        pickedFood: !error ? queryFoodPayload : [],
      });
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

const createDraftMenu = createAsyncThunk(
  'app/PartnerManageMenus/CREATE_DRAFT_MENU',
  async (
    _: TObject | undefined,
    { getState, fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const {
        menuName,
        startDate,
        endDate,
        mealTypes = [],
        daysOfWeek = [],
      } = getState().PartnerManageMenus.draftMenu || {};
      const { currentUser } = getState().user;

      const { restaurantListingId } = CurrentUser(currentUser!).getMetadata();

      const createMenuResponse = await createDraftMenuApi({
        dataParams: {
          title: menuName,
          menuType: EMenuType.fixedMenu,
          startDate,
          endDate,
          mealTypes,
          mealType: mealTypes[0],
          daysOfWeek,
          restaurantId: restaurantListingId,
        },
        queryParams: {
          expand: true,
        },
      });

      return fulfillWithValue(
        denormalisedResponseEntities(createMenuResponse?.data)[0],
      );
    } catch (error) {
      console.error(`CREATE_DRAFT_MENU error: `, error);

      return rejectWithValue(storableAxiosError(error));
    }
  },
);

const changeMenuEndDateInBulk = createAsyncThunk(
  'app/PartnerManageMenus/CHANGE_MENU_END_DATE_IN_BULK',
  async (_: TObject | undefined) => {
    try {
      await changeMenuEndDateInBulkApi({
        type: 'change-end-date-in-bulk',
      });
    } catch (error) {
      console.error(`CREATE_DRAFT_MENU error: `, error);
    }
  },
);

const fetchAllBookersAndParticipants = createAsyncThunk(
  'app/PartnerManageMenus/FETCH_ALL_USERS',
  async ({ type }: { type: ToolType }) => {
    if (type === 'fetch-all-partners') {
      const partners = (await changeMenuEndDateInBulkApi({
        type: 'fetch-all-partners',
      })) as {
        data: {
          url: string;
          partnerName: string;
        }[];
      };

      const partnersWS = xlsx.utils.json_to_sheet(partners.data);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, partnersWS, 'Partners');
      xlsx.writeFile(wb, 'partners.xlsx');

      return partners;
    }

    try {
      const users = (await changeMenuEndDateInBulkApi({
        type: 'fetch-all-bookers-participants',
      })) as {
        data: {
          email: string;
          fullName: string;
          companyName?: string;
          role: 'partner' | 'admin' | 'owner' | 'participant' | 'booker';
        }[];
      };

      const usersWS = xlsx.utils.json_to_sheet(
        users.data.filter(
          (user) => user.role === 'participant' || user.role === 'booker',
        ),
      );
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, usersWS, 'Users');
      xlsx.writeFile(wb, 'users.xlsx');

      return users;
    } catch (error) {
      console.error(`CREATE_DRAFT_MENU error: `, error);
    }
  },
);

const updateDraftMenu = createAsyncThunk(
  'app/PartnerManageMenus/UPDATE_DRAFT_MENU',
  async (
    { isDraftEditFlow }: TObject,
    { getState, fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const {
        menuName,
        startDate,
        endDate,
        mealType,
        mealTypes = [],
        daysOfWeek = [],
        foodsByDate, // init food by date for publish menu
        draftFoodByDate, // init food by date for draft menu
        foodByDate, // update value
      } = getState().PartnerManageMenus.draftMenu || {};
      const menu = getState().PartnerManageMenus.menu || {};
      const { currentUser } = getState().user;

      const menuGetter = Listing(menu! as TListing);
      const { restaurantListingId } = CurrentUser(currentUser!).getMetadata();

      const mealTypesMaybe = isDraftEditFlow ? { mealTypes } : {};
      const isFoodByDateChanged = !isEqual(
        foodByDate,
        isDraftEditFlow ? draftFoodByDate : foodsByDate,
      );
      const foodByDateMaybe = isFoodByDateChanged
        ? { foodsByDate: foodByDate }
        : {};

      const updateMenuResponse = await updateMenuApi({
        dataParams: {
          id: menuGetter.getId(),
          title: menuName,
          startDate,
          endDate,
          ...mealTypesMaybe,
          ...foodByDateMaybe,
          mealType: mealType || mealTypes[0],
          daysOfWeek,
          restaurantId: restaurantListingId,
          isDraftEditFlow,
        },
        queryParams: {
          expand: true,
        },
      });

      return fulfillWithValue(
        denormalisedResponseEntities(updateMenuResponse?.data)[0],
      );
    } catch (error) {
      console.error(`UPDATE_DRAFT_MENU error: `, error);

      return rejectWithValue(storableAxiosError(error));
    }
  },
);

const publishDraftMenu = createAsyncThunk(
  'app/PartnerManageMenus/PUBLISH_DRAFT_MENU',
  async (
    _: TObject | undefined,
    { getState, fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const {
        menuName,
        startDate,
        endDate,
        foodByDate = {},
        mealTypes = [],
        daysOfWeek = [],
      } = getState().PartnerManageMenus.draftMenu || {};
      const menu = getState().PartnerManageMenus.menu || {};
      const { currentUser } = getState().user;

      const menuGetter = Listing(menu! as TListing);
      const { restaurantListingId } = CurrentUser(currentUser!).getMetadata();

      await publishDraftMenuApi({
        dataParams: {
          id: menuGetter.getId(),
          title: menuName,
          menuType: EMenuType.fixedMenu,
          startDate,
          endDate,
          mealTypes,
          draftFoodByDate: foodByDate,
          mealType: mealTypes[0],
          daysOfWeek,
          restaurantId: restaurantListingId,
        },
        queryParams: {
          expand: true,
        },
      });

      return fulfillWithValue(null);
    } catch (error) {
      console.error(`PUBLISH_DRAFT_MENU error: `, error);

      return rejectWithValue(error);
    }
  },
);

export const PartnerManageMenusThunks = {
  loadData,
  toggleMenuActiveStatus,
  preDeleteMenus,
  deleteMenus,
  createDraftMenu,
  changeMenuEndDateInBulk,
  fetchAllBookersAndParticipants,
  updateDraftMenu,
  loadMenuData,
  publishDraftMenu,
};

// ================ Slice ================ //
const PartnerManageMenusSlice = createSlice({
  name: 'PartnerManageMenus',
  initialState,
  reducers: {
    saveDraft: (state, { payload }) => {
      state.draftMenu = payload;
    },
    addPickedFood: (state, { payload }) => {
      state.pickedFood = uniqBy([...state.pickedFood, ...payload], 'id.uuid');
    },
    clearCreateOrUpdateMenuError: (state) => {
      state.createDraftMenuError = null;
      state.publishDraftMenuError = null;
      state.updateDraftMenuError = null;
    },
    clearLoadedMenuData: (state) => {
      state.menu = null;
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
        let newMenuList = state.menus;
        const fakeDeletedMenuList = payload.map((uuid: string) => ({
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
      })
      /* =============== createDraftMenu =============== */
      .addCase(createDraftMenu.pending, (state) => {
        state.createDraftMenuInProgress = true;
        state.createDraftMenuError = null;
      })
      .addCase(createDraftMenu.fulfilled, (state, { payload }) => {
        state.createDraftMenuInProgress = false;
        state.menu = payload;
      })
      .addCase(createDraftMenu.rejected, (state, { payload }) => {
        state.createDraftMenuInProgress = false;
        state.createDraftMenuError = payload;
      })
      /* =============== loadMenuData =============== */
      .addCase(loadMenuData.pending, (state) => {
        state.loadMenuDataInProgress = true;
      })
      .addCase(loadMenuData.fulfilled, (state, { payload }) => {
        state.loadMenuDataInProgress = false;
        state.menu = payload.menu;
        state.pickedFood = payload.pickedFood;
      })
      .addCase(loadMenuData.rejected, (state) => {
        state.loadMenuDataInProgress = false;
      })
      /* =============== updateDraftMenu =============== */
      .addCase(updateDraftMenu.pending, (state) => {
        state.updateDraftMenuInProgress = true;
        state.updateDraftMenuError = null;
      })
      .addCase(updateDraftMenu.fulfilled, (state, { payload }) => {
        state.updateDraftMenuInProgress = false;
        state.menu = payload;
      })
      .addCase(updateDraftMenu.rejected, (state, { payload }) => {
        state.updateDraftMenuInProgress = false;
        state.updateDraftMenuError = payload;
      })
      /* =============== publishDraftMenu =============== */
      .addCase(publishDraftMenu.pending, (state) => {
        state.publishDraftMenuInProgress = true;
        state.publishDraftMenuError = null;
      })
      .addCase(publishDraftMenu.fulfilled, (state) => {
        state.publishDraftMenuInProgress = false;
      })
      .addCase(publishDraftMenu.rejected, (state, { payload }) => {
        state.publishDraftMenuInProgress = false;
        state.publishDraftMenuError = payload;
      });
  },
});

// ================ Actions ================ //
export const PartnerManageMenusActions = PartnerManageMenusSlice.actions;
export default PartnerManageMenusSlice.reducer;

// ================ Selectors ================ //
