import { updatePlanDetailsApi } from '@apis/orderApi';
import { fetchSearchFilterApi } from '@apis/userApi';
import { queryAllPages } from '@helpers/apiHelpers';
import { createAsyncThunk } from '@redux/redux.helper';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { createSlice } from '@reduxjs/toolkit';
import { ListingTypes } from '@src/types/listingTypes';
import { denormalisedResponseEntities, Listing } from '@utils/data';
import { convertWeekDay } from '@utils/dates';
import type { TListing, TUser } from '@utils/types';
import { DateTime } from 'luxon';

import { getMenuQuery, getRestaurantQuery } from './helpers/searchQuery';

export const MANAGE_ORDER_PAGE_SIZE = 10;

// ================ Initial states ================ //
type TKeyValue<T = string> = {
  key: string;
  label: T;
};

type TOrderInitialState = {
  menuTypes: TKeyValue[];
  categories: TKeyValue[];
  restaurantIdList: string[];

  searchResult: TListing[];
  totalItems: number;
  totalRatings: {
    restaurantId: string;
    totalReviews: number;
  }[];
  combinedRestaurantMenuData: {
    restaurantId: string;
    menuId: string;
  }[];

  fetchFilterInProgress: boolean;
  searchInProgress: boolean;

  order: TListing | null;
  fetchOrderInProgress: boolean;
  fetchOrderError: any;

  planDetail: TListing | null;
  fetchPlanDetailInProgress: boolean;
  fetchPlanDetailError: any;

  updatePlanDetailInProgress: boolean;
  updatePlanDetailError: any;

  companyAccount: TUser | null;
  fetchCompanyAccountInProgress: boolean;
  fetchCompanyAccountError: any;

  restaurantFood: {
    [restaurantId: string]: TListing[];
  };
  fetchRestaurantFoodInProgress: boolean;
  fetchRestaurantFoodError: any;

  currentMenuId?: string;
};

const initialState: TOrderInitialState = {
  menuTypes: [],
  categories: [],
  restaurantIdList: [],

  searchResult: [],
  totalItems: 0,
  totalRatings: [],
  combinedRestaurantMenuData: [],

  fetchFilterInProgress: false,
  searchInProgress: false,

  order: null,
  fetchOrderInProgress: false,
  fetchOrderError: null,

  planDetail: null,
  fetchPlanDetailInProgress: false,
  fetchPlanDetailError: null,

  updatePlanDetailInProgress: false,
  updatePlanDetailError: null,

  companyAccount: null,
  fetchCompanyAccountInProgress: false,
  fetchCompanyAccountError: null,

  restaurantFood: {},
  fetchRestaurantFoodInProgress: false,
  fetchRestaurantFoodError: null,

  currentMenuId: undefined,
};

// ================ Thunk types ================ //
const FETCH_SEARCH_FILTER = 'app/BookerDraftOrderPage/FETCH_SEARCH_FILTER';
const SEARCH_RESTAURANT = 'app/BookerDraftOrderPage/SEARCH_RESTAURANT';
const FETCH_FOOD_LIST_FROM_RESTAURANT =
  'app/BookerDraftOrderPage/FETCH_FOOD_LIST_FROM_RESTAURANT';
const FETCH_ORDER = 'app/BookerSelectRestaurant/FETCH_ORDER';
const FETCH_PLAN_DETAIL = 'app/BookerSelectRestaurant/FETCH_PLAN_DETAIL';
const UPDATE_PLAN_DETAIL = 'app/BookerSelectRestaurant/UPDATE_PLAN_DETAIL';
const FETCH_COMPANY_FROM_ORDER =
  'app/BookerSelectRestaurant/FETCH_COMPANY_FROM_ORDER';

// ================ Async thunks ================ //
const fetchSearchFilter = createAsyncThunk(FETCH_SEARCH_FILTER, async () => {
  const { data: searchFiltersResponse } = await fetchSearchFilterApi();
  return searchFiltersResponse;
});

const searchRestaurants = createAsyncThunk(
  SEARCH_RESTAURANT,
  async (params: Record<string, any>, { extra: sdk, getState, dispatch }) => {
    const { orderId } = params;

    await dispatch(orderAsyncActions.fetchOrder(orderId));
    const { order } = getState().Order;
    const { restaurantIdList = [], companyAccount } =
      getState().BookerSelectRestaurant;

    const query = getMenuQuery({ order, params });

    const allMenus = await queryAllPages({ sdkModel: sdk.listings, query });

    const combinedRestaurantMenuData = allMenus.map((menu: TListing) => ({
      restaurantId: Listing(menu).getMetadata()?.restaurantId,
      menuId: menu.id.uuid,
    }));

    const { query: restaurantQuery, restaurantIds: newRestaurantIds } =
      getRestaurantQuery({
        menuList: combinedRestaurantMenuData,
        restaurantIds: restaurantIdList,
        companyAccount,
        params,
      });

    const restaurantsResponse = await sdk.listings.query(restaurantQuery);

    const { meta } = restaurantsResponse.data;

    const restaurants = denormalisedResponseEntities(restaurantsResponse);
    const totalRatings = await Promise.all(
      restaurants.map(async (restaurant: TListing) => {
        const restaurantId = restaurant.id.uuid;
        const reviewsResponse = await sdk.reviews.query({
          listingId: restaurantId,
          type: 'ofCustomer',
        });
        const { meta: reviewMeta } = reviewsResponse.data;
        return {
          restaurantId,
          totalReviews: reviewMeta.totalItems,
        };
      }),
    );

    return {
      ...(newRestaurantIds.length > 0 && {
        restaurantIdList: newRestaurantIds,
      }),
      searchResult: restaurants,
      combinedRestaurantMenuData,
      totalItems: meta.totalItems,
      totalRatings,
    };
  },
);

const fetchOrder = createAsyncThunk(
  FETCH_ORDER,
  async (orderId: string, { extra: sdk }) => {
    const response = denormalisedResponseEntities(
      await sdk.listings.show({
        id: orderId,
      }),
    )[0];
    return response;
  },
);

const fetchPlanDetail = createAsyncThunk(
  FETCH_PLAN_DETAIL,
  async (planId: string, { extra: sdk }) => {
    if (planId) {
      const response = denormalisedResponseEntities(
        await sdk.listings.show({
          id: planId,
        }),
      )[0];
      return response;
    }
    return {};
  },
);

const updatePlanDetail = createAsyncThunk(
  UPDATE_PLAN_DETAIL,
  async ({ orderId, planId, orderDetail, updateMode = 'merge' }: any, _) => {
    const { data: planListing } = await updatePlanDetailsApi(orderId, {
      orderDetail,
      planId,
      updateMode,
    });
    return planListing;
  },
);

const fetchCompanyAccount = createAsyncThunk(
  FETCH_COMPANY_FROM_ORDER,
  async (companyId: string, { extra: sdk }) => {
    const companyAccount = denormalisedResponseEntities(
      await sdk.users.show({
        id: companyId,
      }),
    )[0];

    return companyAccount;
  },
);

const fetchFoodListFromRestaurant = createAsyncThunk(
  FETCH_FOOD_LIST_FROM_RESTAURANT,
  async (params: Record<string, any>, { getState, dispatch, extra: sdk }) => {
    const {
      restaurantId,
      menuId: menuIdParam,
      timestamp,
      keywords = '',
    } = params;
    const { combinedRestaurantMenuData = [], restaurantFood = {} } =
      getState().BookerSelectRestaurant;
    const dateTime = DateTime.fromMillis(timestamp);
    const dayOfWeek = convertWeekDay(dateTime.weekday).key;
    const menuId =
      menuIdParam ||
      combinedRestaurantMenuData.find(
        (item) => item.restaurantId === restaurantId,
      )?.menuId;
    const { order } = getState().Order;
    const { nutritions = [], packagePerMember } = Listing(
      order as TListing,
    ).getMetadata();

    const response = await sdk.listings.query({
      pub_menuIdList: `has_any:${menuId}`,
      meta_listingType: ListingTypes.FOOD,
      pub_menuWeekDay: `has_any:${dayOfWeek}`,
      price: `,${packagePerMember}`,
      ...(nutritions.length > 0
        ? { pub_nutritions: `has_any:${nutritions.join(',')}` }
        : {}),
      include: ['images'],
      ...(keywords && { keywords }),
    });
    const foodList = denormalisedResponseEntities(response);

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    dispatch(BookerSelectRestaurantActions.setCurrentMenuId(menuId));

    const newRestaurantFood = {
      ...restaurantFood,
      [restaurantId]: foodList,
    };
    return newRestaurantFood;
  },
);

export const BookerSelectRestaurantThunks = {
  fetchSearchFilter,
  searchRestaurants,
  fetchFoodListFromRestaurant,

  fetchOrder,
  fetchPlanDetail,
  updatePlanDetail,

  fetchCompanyAccount,
};

const BookerSelectRestaurantSlice = createSlice({
  name: 'BookerSelectRestaurant',
  initialState,
  reducers: {
    setCurrentMenuId: (state, action) => {
      state.currentMenuId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchFilter.pending, (state) => {
        state.fetchFilterInProgress = true;
      })
      .addCase(fetchSearchFilter.fulfilled, (state, action) => {
        state.fetchFilterInProgress = false;
        state.menuTypes = action.payload.menuTypes;
        state.categories = action.payload.categories;
      })
      .addCase(searchRestaurants.pending, (state) => {
        state.searchInProgress = true;
      })
      .addCase(searchRestaurants.fulfilled, (state, action) => {
        state.searchInProgress = false;
        state.restaurantIdList = action.payload.restaurantIdList ?? [];
        state.searchResult = action.payload.searchResult ?? [];
        state.totalItems = action.payload.totalItems ?? 0;
        state.totalRatings = action.payload.totalRatings ?? [];
        state.combinedRestaurantMenuData =
          action.payload.combinedRestaurantMenuData ?? [];
      })
      .addCase(searchRestaurants.rejected, (state) => {
        state.searchInProgress = false;
      })
      .addCase(fetchOrder.pending, (state) => ({
        ...state,
        fetchOrderInProgress: true,
        fetchOrderError: null,
      }))
      .addCase(fetchOrder.fulfilled, (state, { payload }) => ({
        ...state,
        fetchOrderInProgress: false,
        order: payload,
      }))
      .addCase(fetchOrder.rejected, (state, { error }) => ({
        ...state,
        fetchOrderInProgress: false,
        fetchOrderError: error,
      }))
      .addCase(fetchPlanDetail.pending, (state) => ({
        ...state,
        fetchPlanDetailInProgress: true,
        fetchPlanDetailError: null,
      }))
      .addCase(fetchPlanDetail.fulfilled, (state, { payload }) => ({
        ...state,
        fetchPlanDetailInProgress: false,
        planDetail: payload,
      }))
      .addCase(fetchPlanDetail.rejected, (state, { error }) => ({
        ...state,
        fetchPlanDetailInProgress: false,
        fetchPlanDetailError: error,
      }))
      .addCase(updatePlanDetail.pending, (state) => ({
        ...state,
        updatePlanDetailInProgress: true,
        updatePlanDetailError: null,
      }))
      .addCase(updatePlanDetail.fulfilled, (state, { payload }) => ({
        ...state,
        updatePlanDetailInProgress: false,
        planDetail: payload,
      }))
      .addCase(updatePlanDetail.rejected, (state, { error }) => ({
        ...state,
        updatePlanDetailInProgress: false,
        updatePlanDetailError: error,
      }))
      .addCase(fetchCompanyAccount.pending, (state) => ({
        ...state,
        fetchCompanyAccountInProgress: true,
        fetchCompanyAccountError: null,
      }))
      .addCase(fetchCompanyAccount.fulfilled, (state, { payload }) => ({
        ...state,
        fetchCompanyAccountInProgress: false,
        companyAccount: payload,
      }))
      .addCase(fetchCompanyAccount.rejected, (state, { error }) => ({
        ...state,
        fetchCompanyAccountInProgress: false,
        fetchCompanyAccountError: error,
      }))
      .addCase(fetchFoodListFromRestaurant.pending, (state) => {
        state.fetchRestaurantFoodInProgress = true;
        state.fetchRestaurantFoodError = null;
      })
      .addCase(fetchFoodListFromRestaurant.fulfilled, (state, action) => {
        state.restaurantFood = action.payload;
        state.fetchRestaurantFoodInProgress = false;
      })
      .addCase(fetchFoodListFromRestaurant.rejected, (state, { payload }) => {
        state.fetchRestaurantFoodInProgress = false;
        state.fetchRestaurantFoodError = payload;
      });
  },
});

export const BookerSelectRestaurantActions =
  BookerSelectRestaurantSlice.actions;

export default BookerSelectRestaurantSlice.reducer;
