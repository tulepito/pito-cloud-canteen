import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import {
  checkMenuInTransactionProgressApi,
  createPartnerMenuApi,
  deletePartnerMenuApi,
  queryAllMenusApi,
  showPartnerMenuApi,
  updatePartnerMenuApi,
} from '@utils/api';
import { denormalisedResponseEntities } from '@utils/data';
import { EListingType, EMenuMealType } from '@utils/enums';
import { storableError } from '@utils/errors';
import type { TIntergrationListing, TListing, TPagination } from '@utils/types';

export const MANAGE_MENU_PAGE_SIZE = 10;

// ================ Initial states ================ //

export type TMenuMealTypeCount = {
  [EMenuMealType.breakfast]: number;
  [EMenuMealType.dinner]: number;
  [EMenuMealType.lunch]: number;
  [EMenuMealType.snack]: number;
};

type TMenusSliceState = {
  menus: TIntergrationListing[];
  queryMenusInProgress: boolean;
  queryMenusError: any;
  manageMenusPagination: TPagination | null;
  menuMealTypeCount: TMenuMealTypeCount;
  getNumberOfMenuByMealTypeInProgress: boolean;
  getNumberOfMenuByMealTypeError: any;

  createOrUpdateMenuInProgress: boolean;
  createOrUpdateMenuError: any;
  currentMenu: TListing | null;

  showCurrentMenuInProgress: boolean;
  showCurrentMenuError: any;

  removeMenuInProgress: boolean;
  removeMenuError: any;

  menuOptionsToDuplicate: TIntergrationListing[];
  queryMenuOptionsInProgress: boolean;
  queryMenuOptionsError: any;

  isCheckingMenuInTransactionProgress: boolean;
  checkingMenuInTransactionError: any;
};
const initialState: TMenusSliceState = {
  menus: [],
  queryMenusInProgress: false,
  queryMenusError: null,
  manageMenusPagination: null,
  menuMealTypeCount: {
    [EMenuMealType.breakfast]: 0,
    [EMenuMealType.dinner]: 0,
    [EMenuMealType.lunch]: 0,
    [EMenuMealType.snack]: 0,
  },
  getNumberOfMenuByMealTypeInProgress: false,
  getNumberOfMenuByMealTypeError: null,

  createOrUpdateMenuInProgress: false,
  createOrUpdateMenuError: null,
  currentMenu: null,

  showCurrentMenuInProgress: false,
  showCurrentMenuError: null,

  removeMenuInProgress: false,
  removeMenuError: null,

  menuOptionsToDuplicate: [],
  queryMenuOptionsInProgress: false,
  queryMenuOptionsError: null,

  isCheckingMenuInTransactionProgress: false,
  checkingMenuInTransactionError: null,
};

// ================ Thunk types ================ //

const QUERY_PARTNER_MENUS = 'app/ManageMenusPage/QUERY_PARTNER_MENUS';
const GET_NUMBER_OF_MENU_BY_MEAL_TYPE =
  'app/ManageMenusPage/GET_NUMBER_OF_MENU_BY_MEAL_TYPE';
const CREATE_PARTNER_MENU_LISTING =
  'app/ManageMenusPage/CREATE_PARTNER_MENU_LISTING';

const SHOW_PARTNER_MENU_LISTING =
  'app/ManageMenusPage/SHOW_PARTNER_MENU_LISTING';

const UPDATE_PARTNER_MENU_LISTING =
  'app/ManageMenusPage/UPDATE_PARTNER_MENU_LISTING';

const DELETE_PARTNER_MENU_LISTING =
  'app/ManageMenusPage/DELETE_PARTNER_MENU_LISTING';

const QUERY_MENU_OPTIONS_TO_DUPLICATE =
  'app/ManageMenusPage/QUERY_MENU_OPTIONS_TO_DUPLICATE';

const CHECK_MENU_IS_IN_TRANSACTION_PROGRESS =
  'app/ManageMenusPage/CHECK_MENU_IS_IN_TRANSACTION_PROGRESS';

// ================ Async thunks ================ //

const queryPartnerMenus = createAsyncThunk(
  QUERY_PARTNER_MENUS,
  async (payload: any, { extra: sdk }) => {
    const { restaurantId, menuType, mealTypes, keywords } = payload;
    const response = await sdk.listings.query({
      keywords,
      meta_menuType: menuType,
      meta_listingType: EListingType.menu,
      meta_restaurantId: restaurantId,
      pub_mealTypes: mealTypes,
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

const getNumberOfMenuByMealType = createAsyncThunk(
  GET_NUMBER_OF_MENU_BY_MEAL_TYPE,
  async (payload: any, { extra: sdk }) => {
    try {
      const { restaurantId, menuType } = payload;
      let menuMealTypeCount = {
        ...initialState.menuMealTypeCount,
      };
      await Promise.all(
        Object.keys(EMenuMealType).map(async (key) => {
          const response = await sdk.listings.query({
            meta_menuType: menuType,
            meta_listingType: EListingType.menu,
            meta_restaurantId: restaurantId,
            pub_mealTypes: key,
            meta_isDeleted: false,
            perPage: MANAGE_MENU_PAGE_SIZE,
          });
          const totalItems = response.data.meta.totalItems as number;
          menuMealTypeCount = {
            ...menuMealTypeCount,
            [key]: totalItems,
          };
          return response;
        }),
      );
      return menuMealTypeCount as TMenuMealTypeCount;
    } catch (error) {
      return storableError(error);
    }
  },
);

const createPartnerMenuListing = createAsyncThunk(
  CREATE_PARTNER_MENU_LISTING,
  async (payload: any, { rejectWithValue }) => {
    try {
      const { data } = await createPartnerMenuApi({
        dataParams: payload,
        queryParams: {
          expand: true,
        },
      });
      return denormalisedResponseEntities(data)[0];
    } catch (error) {
      console.error(`${CREATE_PARTNER_MENU_LISTING} error: `, error);
      return rejectWithValue(storableError(error));
    }
  },
);

const updatePartnerMenuListing = createAsyncThunk(
  UPDATE_PARTNER_MENU_LISTING,
  async (payload: any, { rejectWithValue }) => {
    try {
      const { data } = await updatePartnerMenuApi({
        dataParams: payload,
        queryParams: {
          expand: true,
        },
      });
      return denormalisedResponseEntities(data)[0];
    } catch (error) {
      console.error(`${CREATE_PARTNER_MENU_LISTING} error: `, error);
      return rejectWithValue(storableError(error));
    }
  },
);

const showPartnerMenuListing = createAsyncThunk(
  SHOW_PARTNER_MENU_LISTING,
  async (id: any, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await showPartnerMenuApi(id, {
        dataParams: {},
        queryParams: {
          expand: true,
        },
      });
      const [food] = denormalisedResponseEntities(data);
      return fulfillWithValue(food);
    } catch (error) {
      console.error(`${SHOW_PARTNER_MENU_LISTING} error: `, error);
      return rejectWithValue(storableError(error));
    }
  },
);

const deletePartnerMenu = createAsyncThunk(
  DELETE_PARTNER_MENU_LISTING,
  async (payload: any, { rejectWithValue }) => {
    try {
      const { data } = await deletePartnerMenuApi({
        dataParams: {
          ...payload,
        },
        queryParams: {},
      });
      return data;
    } catch (error) {
      console.error(`${DELETE_PARTNER_MENU_LISTING} error: `, error);
      return rejectWithValue(storableError(error));
    }
  },
);

const queryMenuOptionsToDuplicate = createAsyncThunk(
  QUERY_MENU_OPTIONS_TO_DUPLICATE,
  async (payload: any, { rejectWithValue }) => {
    try {
      const { data } = await queryAllMenusApi({
        dataParams: {
          ...payload,
        },
        queryParams: {},
      });
      return data;
    } catch (error) {
      console.error(`${QUERY_MENU_OPTIONS_TO_DUPLICATE} error: `, error);
      return rejectWithValue(storableError(error));
    }
  },
);

const checkingMenuInTransactionProgress = createAsyncThunk(
  CHECK_MENU_IS_IN_TRANSACTION_PROGRESS,
  async (id: any, { rejectWithValue, fulfillWithValue }) => {
    try {
      const { data } = await checkMenuInTransactionProgressApi(id);
      const { isInTransactionProgress } = data;
      return fulfillWithValue(isInTransactionProgress);
    } catch (error) {
      console.error(`${SHOW_PARTNER_MENU_LISTING} error: `, error);
      return rejectWithValue(storableError(error));
    }
  },
);

export const menusSliceThunks = {
  queryPartnerMenus,
  getNumberOfMenuByMealType,
  createPartnerMenuListing,
  showPartnerMenuListing,
  updatePartnerMenuListing,
  deletePartnerMenu,
  queryMenuOptionsToDuplicate,
  checkingMenuInTransactionProgress,
};

// ================ Slice ================ //
const menusSliceSlice = createSlice({
  name: 'menusSlice',
  initialState,
  reducers: {
    setInitialStates: () => ({
      ...initialState,
    }),
  },
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
        queryMenusInProgress: false,
      }))
      .addCase(queryPartnerMenus.rejected, (state, { payload }) => ({
        ...state,
        queryMenusInProgress: false,
        queryMenusError: payload,
      }))

      .addCase(getNumberOfMenuByMealType.pending, (state) => ({
        ...state,
        getNumberOfMenuByMealTypeInProgress: true,
      }))
      .addCase(getNumberOfMenuByMealType.fulfilled, (state, { payload }) => ({
        ...state,
        menuMealTypeCount: payload as TMenuMealTypeCount,
        getNumberOfMenuByMealTypeInProgress: false,
      }))
      .addCase(getNumberOfMenuByMealType.rejected, (state, { payload }) => ({
        ...state,
        getNumberOfMenuByMealTypeInProgress: false,
        getNumberOfMenuByMealTypeError: payload,
      }))
      .addCase(createPartnerMenuListing.pending, (state) => ({
        ...state,
        createOrUpdateMenuInProgress: true,
        createOrUpdateMenuError: null,
      }))
      .addCase(createPartnerMenuListing.fulfilled, (state, { payload }) => ({
        ...state,
        createOrUpdateMenuInProgress: false,
        currentMenu: payload,
      }))
      .addCase(createPartnerMenuListing.rejected, (state, { payload }) => ({
        ...state,
        createOrUpdateMenuInProgress: false,
        createOrUpdateMenuError: payload,
      }))
      .addCase(showPartnerMenuListing.pending, (state) => ({
        ...state,
        showCurrentMenuInProgress: true,
        showCurrentMenuError: null,
      }))
      .addCase(showPartnerMenuListing.fulfilled, (state, { payload }) => ({
        ...state,
        showCurrentMenuInProgress: false,
        currentMenu: payload,
      }))
      .addCase(showPartnerMenuListing.rejected, (state, { payload }) => ({
        ...state,
        showCurrentMenuInProgress: false,
        showCurrentMenuError: payload,
      }))
      .addCase(updatePartnerMenuListing.pending, (state) => ({
        ...state,
        createOrUpdateMenuInProgress: true,
        createOrUpdateMenuError: null,
      }))
      .addCase(updatePartnerMenuListing.fulfilled, (state, { payload }) => ({
        ...state,
        createOrUpdateMenuInProgress: false,
        currentMenu: payload,
      }))
      .addCase(updatePartnerMenuListing.rejected, (state, { payload }) => ({
        ...state,
        createOrUpdateMenuInProgress: false,
        createOrUpdateMenuError: payload,
      }))
      .addCase(deletePartnerMenu.pending, (state, { meta }) => ({
        ...state,
        removeMenuInProgress: meta.arg.id || meta.arg.ids,
        removeMenuError: null,
      }))
      .addCase(deletePartnerMenu.fulfilled, (state) => ({
        ...state,
        removeMenuInProgress: false,
      }))
      .addCase(deletePartnerMenu.rejected, (state, { payload }) => ({
        ...state,
        removeMenuInProgress: false,
        removeMenuError: payload,
      }))
      .addCase(queryMenuOptionsToDuplicate.pending, (state) => ({
        ...state,
        queryMenuOptionsInProgress: true,
        queryMenuOptionsError: null,
      }))
      .addCase(queryMenuOptionsToDuplicate.fulfilled, (state, { payload }) => ({
        ...state,
        menuOptionsToDuplicate: payload,
        queryMenuOptionsInProgress: false,
      }))
      .addCase(queryMenuOptionsToDuplicate.rejected, (state, { payload }) => ({
        ...state,
        queryMenuOptionsInProgress: false,
        queryMenuOptionsError: payload,
      }))
      .addCase(checkingMenuInTransactionProgress.pending, (state) => ({
        ...state,
        isCheckingMenuInTransactionProgress: true,
        checkingMenuInTransactionError: null,
      }))
      .addCase(checkingMenuInTransactionProgress.fulfilled, (state) => ({
        ...state,
        isCheckingMenuInTransactionProgress: false,
      }))
      .addCase(
        checkingMenuInTransactionProgress.rejected,
        (state, { payload }) => ({
          ...state,
          isCheckingMenuInTransactionProgress: false,
          checkingMenuInTransactionError: payload,
        }),
      );
  },
});

// ================ Actions ================ //
export const menusSliceAction = menusSliceSlice.actions;
export default menusSliceSlice.reducer;

// ================ Selectors ================ //
