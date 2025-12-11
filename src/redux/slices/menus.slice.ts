import { createSlice } from '@reduxjs/toolkit';

import {
  checkMenuInTransactionProgressApi,
  checkMenuUnConflictedApi,
  closePartnerMenuApi,
  createPartnerMenuApi,
  deletePartnerMenuApi,
  duplicatePartnerMenuApi,
  publishPartnerMenuApi,
  queryAllMenusApi,
  showPartnerMenuApi,
  updatePartnerMenuApi,
} from '@apis/menuApi';
import type { TCheckUnConflictedParams } from '@helpers/apiHelpers';
import { createAsyncThunk } from '@redux/redux.helper';
import { denormalisedResponseEntities } from '@utils/data';
import type { EListingStates } from '@utils/enums';
import { EListingType, EMenuMealType } from '@utils/enums';
import { storableAxiosError, storableError } from '@utils/errors';
import type {
  TCreateMenuApiParams,
  TDuplicateMenuApiParams,
  TIntegrationListing,
  TListing,
  TPagination,
} from '@utils/types';

export const MANAGE_MENU_PAGE_SIZE = 10;

// ================ Initial states ================ //

export type TMenuMealTypeCount = {
  [EMenuMealType.breakfast]: number;
  [EMenuMealType.dinner]: number;
  [EMenuMealType.lunch]: number;
  [EMenuMealType.snack]: number;
};

type TMenusSliceState = {
  menus: TIntegrationListing[];
  queryMenusInProgress: boolean;
  queryMenusError: any;
  manageMenusPagination: TPagination | null;
  menuMealTypeCount: TMenuMealTypeCount;
  getNumberOfMenuByMealTypeInProgress: boolean;
  getNumberOfMenuByMealTypeError: any;

  createOrUpdateMenuInProgress: boolean;
  createOrUpdateMenuError: any;
  currentMenu: TListing | TIntegrationListing | null;

  showCurrentMenuInProgress: boolean;
  showCurrentMenuError: any;

  removeMenuInProgress: boolean;
  removeMenuError: any;

  menuOptionsToDuplicate: TIntegrationListing[];
  queryMenuOptionsInProgress: boolean;
  queryMenuOptionsError: any;

  isCheckingMenuInTransactionProgress: boolean;
  checkingMenuInTransactionError: any;

  isCheckingMenuUnConflicted: boolean;
  checkingMenuUnConflictedError: any;

  toggleMenuStateInProgressId: string | null;
  toggleMenuStateError: any;

  publishMenuInProgressId: string | null;
  publishMenuError: any;

  closeMenuInProgressId: string | null;
  closeMenuError: any;
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

  isCheckingMenuUnConflicted: false,
  checkingMenuUnConflictedError: null,

  toggleMenuStateInProgressId: null,
  toggleMenuStateError: null,

  publishMenuInProgressId: null,
  publishMenuError: null,

  closeMenuInProgressId: null,
  closeMenuError: null,
};

// ================ Thunk types ================ //

const QUERY_PARTNER_MENUS = 'app/ManageMenusPage/QUERY_PARTNER_MENUS';
const GET_NUMBER_OF_MENU_BY_MEAL_TYPE =
  'app/ManageMenusPage/GET_NUMBER_OF_MENU_BY_MEAL_TYPE';
const CREATE_PARTNER_MENU_LISTING =
  'app/ManageMenusPage/CREATE_PARTNER_MENU_LISTING';

const DUPLICATE_PARTNER_MENU_LISTING =
  'app/ManageMenusPage/DUPLICATE_PARTNER_MENU_LISTING';

const SHOW_PARTNER_MENU_LISTING =
  'app/ManageMenusPage/SHOW_PARTNER_MENU_LISTING';

const UPDATE_PARTNER_MENU_LISTING =
  'app/ManageMenusPage/UPDATE_PARTNER_MENU_LISTING';

const TOGGLE_PARTNER_MENU_LISTING =
  'app/ManageMenusPage/TOGGLE_PARTNER_MENU_LISTING';

const DELETE_PARTNER_MENU_LISTING =
  'app/ManageMenusPage/DELETE_PARTNER_MENU_LISTING';

const QUERY_MENU_OPTIONS_TO_DUPLICATE =
  'app/ManageMenusPage/QUERY_MENU_OPTIONS_TO_DUPLICATE';

const CHECK_MENU_IS_IN_TRANSACTION_PROGRESS =
  'app/ManageMenusPage/CHECK_MENU_IS_IN_TRANSACTION_PROGRESS';

const CHECK_MENU_IS_UN_CONFLICTED =
  'app/ManageMenusPage/CHECK_MENU_IS_UN_CONFLICTED';

const ADMIN_PUBLISH_MENU = 'app/ManageMenusPage/ADMIN_PUBLISH_MENU';
const ADMIN_CLOSE_MENU = 'app/ManageMenusPage/ADMIN_CLOSE_MENU';

// ================ Async thunks ================ //

const checkMenuUnconflicted = createAsyncThunk(
  CHECK_MENU_IS_UN_CONFLICTED,
  async (payload: TCheckUnConflictedParams) => {
    const { data } = await checkMenuUnConflictedApi(payload);

    return data;
  },
  {
    serializeError: storableAxiosError,
  },
);

const queryPartnerMenus = createAsyncThunk(
  QUERY_PARTNER_MENUS,
  async (payload: any, { extra: sdk }) => {
    const { restaurantId, menuType, mealType, keywords, page } = payload;
    const response = await sdk.listings.query({
      keywords,
      meta_menuType: menuType,
      meta_listingType: EListingType.menu,
      meta_restaurantId: restaurantId,
      meta_isDeleted: false,
      pub_mealType: mealType,
      page,
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
            pub_mealType: key,
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
  async (payload: TCreateMenuApiParams, { rejectWithValue }) => {
    try {
      const { data } = await createPartnerMenuApi(payload, {
        expand: true,
      });
      const [menu] = denormalisedResponseEntities(data);

      return menu;
    } catch (error) {
      console.error(`${CREATE_PARTNER_MENU_LISTING} error: `, error);

      return rejectWithValue(storableAxiosError(error));
    }
  },
);

const duplicatePartnerMenuListing = createAsyncThunk(
  DUPLICATE_PARTNER_MENU_LISTING,
  async (payload: TDuplicateMenuApiParams, { rejectWithValue }) => {
    try {
      const { data } = await duplicatePartnerMenuApi(payload.id, payload, {
        expand: true,
      });
      const [menu] = denormalisedResponseEntities(data);

      return menu;
    } catch (error) {
      console.error(`${CREATE_PARTNER_MENU_LISTING} error: `, error);

      return rejectWithValue(storableAxiosError(error));
    }
  },
);

const updatePartnerMenuListing = createAsyncThunk(
  UPDATE_PARTNER_MENU_LISTING,
  async (
    { dataParams, shouldPublish }: { dataParams: any; shouldPublish?: boolean },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await updatePartnerMenuApi(dataParams.id, {
        dataParams,
        queryParams: {
          expand: true,
        },
      });

      if (shouldPublish) {
        await publishPartnerMenuApi(dataParams.id);
      }

      return denormalisedResponseEntities(data)[0];
    } catch (error) {
      console.error(`${CREATE_PARTNER_MENU_LISTING} error: `, error);

      return rejectWithValue(storableAxiosError(error));
    }
  },
);

const toggleMenuState = createAsyncThunk(
  TOGGLE_PARTNER_MENU_LISTING,
  async ({
    id,
    listingState,
  }: {
    id: string;
    listingState: EListingStates;
  }) => {
    const { data } = await updatePartnerMenuApi(id, {
      dataParams: {
        metadata: {
          listingState,
        },
      },
      queryParams: {
        expand: true,
      },
    });

    return denormalisedResponseEntities(data)[0];
  },
  {
    serializeError: storableAxiosError,
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
  async ({ restaurantId }: { restaurantId: string }, { rejectWithValue }) => {
    try {
      const { data } = await queryAllMenusApi({ restaurantId });

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

const adminPublishMenu = createAsyncThunk(
  ADMIN_PUBLISH_MENU,
  async (id: string) => {
    const { data } = await publishPartnerMenuApi(id, undefined, {
      expand: true,
    });
    const [menu] = denormalisedResponseEntities(data);

    return menu;
  },
  {
    serializeError: storableAxiosError,
  },
);

const adminCloseMenu = createAsyncThunk(
  ADMIN_CLOSE_MENU,
  async (id: string) => {
    const { data } = await closePartnerMenuApi(id, undefined, { expand: true });
    const [menu] = denormalisedResponseEntities(data);

    return menu;
  },
  {
    serializeError: storableAxiosError,
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
  toggleMenuState,
  checkMenuUnconflicted,
  duplicatePartnerMenuListing,
  adminPublishMenu,
  adminCloseMenu,
};

// ================ Slice ================ //
const menusSliceSlice = createSlice({
  name: 'menusSlice',
  initialState,
  reducers: {
    setInitialStates: () => ({
      ...initialState,
    }),
    clearCreateOrUpdateMenuError: (state) => ({
      ...state,
      createOrUpdateMenuError: null,
      checkingMenuUnConflictedError: null,
    }),
    setCurrentMenu: (state, { payload }) => ({
      ...state,
      currentMenu: payload,
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
      .addCase(duplicatePartnerMenuListing.pending, (state) => ({
        ...state,
        createOrUpdateMenuInProgress: true,
        createOrUpdateMenuError: null,
      }))
      .addCase(duplicatePartnerMenuListing.fulfilled, (state, { payload }) => ({
        ...state,
        createOrUpdateMenuInProgress: false,
        currentMenu: payload,
      }))
      .addCase(duplicatePartnerMenuListing.rejected, (state, { payload }) => ({
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
        checkingMenuUnConflictedError: null,
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
      )
      .addCase(checkMenuUnconflicted.pending, (state) => ({
        ...state,
        isCheckingMenuUnConflicted: true,
        checkingMenuUnConflictedError: null,
      }))
      .addCase(checkMenuUnconflicted.fulfilled, (state) => ({
        ...state,
        isCheckingMenuUnConflicted: false,
      }))
      .addCase(checkMenuUnconflicted.rejected, (state, { error }) => {
        return {
          ...state,
          isCheckingMenuUnConflicted: false,
          checkingMenuUnConflictedError: error,
        };
      })
      .addCase(toggleMenuState.pending, (state, { meta }) => {
        const { id } = meta.arg;

        return {
          ...state,
          toggleMenuStateInProgressId: id,
          toggleMenuStateError: null,
        };
      })
      .addCase(toggleMenuState.fulfilled, (state, { payload }) => {
        const { menus } = state;
        const newMenus = [...menus].map((m) =>
          m.id.uuid === payload.id.uuid ? payload : m,
        );

        return {
          ...state,
          toggleMenuStateInProgressId: null,
          toggleMenuStateError: null,
          menus: newMenus,
        };
      })
      .addCase(toggleMenuState.rejected, (state, { error }) => {
        return {
          ...state,
          toggleMenuStateInProgressId: null,
          toggleMenuStateError: error,
        };
      })
      .addCase(adminPublishMenu.pending, (state, { meta }) => {
        const id = meta.arg;

        return {
          ...state,
          publishMenuInProgressId: id,
          publishMenuError: null,
        };
      })
      .addCase(adminPublishMenu.fulfilled, (state, { payload }) => {
        const { menus } = state;
        const newMenus = [...menus].map((m) =>
          m.id.uuid === payload.id.uuid ? payload : m,
        );

        return {
          ...state,
          publishMenuInProgressId: null,
          menus: newMenus,
        };
      })
      .addCase(adminPublishMenu.rejected, (state, { error }) => ({
        ...state,
        publishMenuInProgressId: null,
        publishMenuError: error,
      }))
      .addCase(adminCloseMenu.pending, (state, { meta }) => ({
        ...state,
        closeMenuInProgressId: meta.arg,
        closeMenuError: null,
      }))
      .addCase(adminCloseMenu.fulfilled, (state, { payload }) => {
        const { menus } = state;
        const newMenus = [...menus].map((m) =>
          m.id.uuid === payload.id.uuid ? payload : m,
        );

        return {
          ...state,
          closeMenuInProgressId: null,
          menus: newMenus,
        };
      })
      .addCase(adminCloseMenu.rejected, (state, { error }) => ({
        ...state,
        closeMenuInProgressId: null,
        closeMenuError: error,
      }));
  },
});

// ================ Actions ================ //
export const menusSliceAction = menusSliceSlice.actions;
export default menusSliceSlice.reducer;

// ================ Selectors ================ //
