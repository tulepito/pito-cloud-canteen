import { createSlice } from '@reduxjs/toolkit';
import keyBy from 'lodash/keyBy';
import mapValue from 'lodash/mapValues';
import { DateTime } from 'luxon';

import { updatePlanDetailsApi } from '@apis/orderApi';
import { fetchSearchFilterApi } from '@apis/userApi';
import { queryAllPages } from '@helpers/apiHelpers';
import type { TMenuQueryParams } from '@helpers/listingSearchQuery';
import { getMenuQuery, getRestaurantQuery } from '@helpers/listingSearchQuery';
import { createAsyncThunk } from '@redux/redux.helper';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { ListingTypes } from '@src/types/listingTypes';
import { UserPermission } from '@src/types/UserPermission';
import { denormalisedResponseEntities, Listing } from '@utils/data';
import { convertWeekDay } from '@utils/dates';
import { EImageVariants, EListingType } from '@utils/enums';
import type { TListing, TUser } from '@utils/types';

export const MANAGE_ORDER_PAGE_SIZE = 10;

// ================ Initial states ================ //
type TKeyValue<T = string> = {
  key: string;
  label: T;
};

type TOrderInitialState = {
  restaurant: TListing | null;

  menuTypes: TKeyValue[];
  categories: TKeyValue[];
  packaging: TKeyValue[];
  restaurantIdList: string[];

  searchResult: TListing[];
  totalItems: number;
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
  selectedRestaurantId: string;

  restaurantBookerReviews: any;
  restaurantBookerReviewers: any;

  restaurantParticipantReviews: any;
  restaurantParticipantReviewers: any;

  fetchRestaurantReviewInProgress: boolean;
  fetchRestaurantReviewError: any;
};

const initialState: TOrderInitialState = {
  restaurant: null,

  menuTypes: [],
  categories: [],
  packaging: [],
  restaurantIdList: [],

  searchResult: [],
  totalItems: 0,
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

  restaurantBookerReviews: [],
  restaurantBookerReviewers: [],

  restaurantParticipantReviews: [],
  restaurantParticipantReviewers: [],

  fetchRestaurantReviewInProgress: false,
  fetchRestaurantReviewError: null,

  selectedRestaurantId: '',
};

// ================ Thunk types ================ //
const FETCH_RESTAURANT = 'app/BookerSelectRestaurant/FETCH_RESTAURANT';
const FETCH_SEARCH_FILTER = 'app/BookerSelectRestaurant/FETCH_SEARCH_FILTER';
const SEARCH_RESTAURANT = 'app/BookerSelectRestaurant/SEARCH_RESTAURANT';
const FETCH_FOOD_LIST_FROM_RESTAURANT =
  'app/BookerSelectRestaurant/FETCH_FOOD_LIST_FROM_RESTAURANT';
const FETCH_ORDER = 'app/BookerSelectRestaurant/FETCH_ORDER';
const FETCH_PLAN_DETAIL = 'app/BookerSelectRestaurant/FETCH_PLAN_DETAIL';
const UPDATE_PLAN_DETAIL = 'app/BookerSelectRestaurant/UPDATE_PLAN_DETAIL';
const FETCH_COMPANY_FROM_ORDER =
  'app/BookerSelectRestaurant/FETCH_COMPANY_FROM_ORDER';
const FETCH_RESTAURANT_REVIEWS =
  'app/BookerSelectRestaurant/FETCH_RESTAURAN_REVIEWS';

// ================ Async thunks ================ //
const fetchRestaurant = createAsyncThunk(
  FETCH_RESTAURANT,
  async (restaurantId: string, { extra: sdk }) => {
    if (restaurantId) {
      const response = denormalisedResponseEntities(
        await sdk.listings.show({
          id: restaurantId,
          include: ['images'],
          'fields.image': [
            `variants.${EImageVariants.default}`,
            `variants.${EImageVariants.squareSmall}`,
            `variants.${EImageVariants.landscapeCrop}`,
            `variants.${EImageVariants.landscapeCrop2x}`,
          ],
        }),
      )[0];

      return response;
    }

    return null;
  },
);

const fetchSearchFilter = createAsyncThunk(FETCH_SEARCH_FILTER, async () => {
  const { data: searchFiltersResponse } = await fetchSearchFilterApi();

  return searchFiltersResponse;
});

const searchRestaurants = createAsyncThunk(
  SEARCH_RESTAURANT,
  async (params: TMenuQueryParams, { extra: sdk, getState, dispatch }) => {
    const { orderId } = params;

    await dispatch(orderAsyncActions.fetchOrder(orderId!));
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

    return {
      ...(newRestaurantIds.length > 0 && {
        restaurantIdList: newRestaurantIds,
      }),
      searchResult: restaurants,
      combinedRestaurantMenuData,
      totalItems: meta.totalItems,
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
    const { restaurantId, menuId: menuIdParam, timestamp, keywords } = params;
    const { combinedRestaurantMenuData = [], restaurantFood = {} } =
      getState().BookerSelectRestaurant;
    const dateTime = DateTime.fromMillis(timestamp);
    const dayOfWeek = convertWeekDay(dateTime.weekday).key;
    const menuId =
      menuIdParam ||
      combinedRestaurantMenuData.find(
        (item) => item.restaurantId === restaurantId,
      )?.menuId;
    const { order } = getState().BookerSelectRestaurant;
    const { nutritions = [] } = Listing(order as TListing).getMetadata();

    const response = await sdk.listings.query({
      pub_menuIdList: `has_any:${menuId}`,
      meta_listingType: ListingTypes.FOOD,
      pub_menuWeekDay: `has_any:${dayOfWeek}`,
      ...(nutritions.length > 0
        ? { pub_specialDiets: `has_any:${nutritions.join(',')}` }
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

const fetchRestaurantReviews = createAsyncThunk(
  FETCH_RESTAURANT_REVIEWS,
  async ({ page = 1, reviewRole }: any, { extra: sdk, getState }) => {
    const { selectedRestaurantId } = getState().BookerSelectRestaurant;
    const response = denormalisedResponseEntities(
      await sdk.listings.query({
        meta_listingType: EListingType.rating,
        meta_restaurantId: selectedRestaurantId,
        page,
        meta_reviewRole: reviewRole,
      }),
    );
    const reviewerResponse = await Promise.all(
      response
        .map((item: TListing) => ({
          reviewerId: Listing(item).getMetadata()?.reviewerId,
          reviewId: Listing(item).getId(),
        }))
        .map(async ({ reviewerId, reviewId }: any) => {
          const reviewer = await sdk.users.show({
            id: reviewerId,
            include: ['profileImage'],
            'fields.image': [
              'variants.square-small',
              'variants.square-small2x',
            ],
          });

          return {
            id: reviewId,
            value: denormalisedResponseEntities(reviewer)[0],
          };
        }),
    );

    return {
      ...(reviewRole === UserPermission.BOOKER && {
        restaurantBookerReviews: response,
        restaurantBookerReviewers: mapValue(
          keyBy(reviewerResponse, 'id'),
          'value',
        ),
      }),
      ...(reviewRole === UserPermission.PARTICIPANT && {
        restaurantParticipantReviews: response,
        restaurantParticipantReviewers: mapValue(
          keyBy(reviewerResponse, 'id'),
          'value',
        ),
      }),
    };
  },
);

export const BookerSelectRestaurantThunks = {
  fetchRestaurant,

  fetchSearchFilter,
  searchRestaurants,
  fetchFoodListFromRestaurant,

  fetchOrder,
  fetchPlanDetail,
  updatePlanDetail,

  fetchCompanyAccount,
  fetchRestaurantReviews,
};

const BookerSelectRestaurantSlice = createSlice({
  name: 'BookerSelectRestaurant',
  initialState,
  reducers: {
    setCurrentMenuId: (state, action) => {
      state.currentMenuId = action.payload;
    },
    setSelectedRestaurantId: (state, action) => {
      state.selectedRestaurantId = action.payload;
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
        state.packaging = action.payload.packaging;
      })
      .addCase(searchRestaurants.pending, (state) => {
        state.searchInProgress = true;
      })
      .addCase(searchRestaurants.fulfilled, (state, action) => {
        state.searchInProgress = false;
        state.restaurantIdList = action.payload.restaurantIdList ?? [];
        state.searchResult = action.payload.searchResult ?? [];
        state.totalItems = action.payload.totalItems ?? 0;
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
      })
      .addCase(fetchRestaurant.pending, (state) => ({
        ...state,
        fetchRestaurantInProgress: true,
        fetchRestaurantError: null,
      }))
      .addCase(fetchRestaurant.fulfilled, (state, { payload }) => ({
        ...state,
        fetchRestaurantInProgress: false,
        restaurant: payload,
      }))
      .addCase(fetchRestaurant.rejected, (state, { error }) => ({
        ...state,
        fetchRestaurantInProgress: false,
        fetchRestaurantError: error,
      }))

      .addCase(fetchRestaurantReviews.pending, (state) => ({
        ...state,
        fetchRestaurantReviewInProgress: true,
        fetchRestaurantReviewError: null,
      }))
      .addCase(fetchRestaurantReviews.fulfilled, (state, { payload }) => ({
        ...state,
        fetchRestaurantReviewInProgress: false,
        restaurantBookerReviews: payload?.restaurantBookerReviews,
        restaurantBookerReviewers: payload?.restaurantBookerReviewers,
        restaurantParticipantReviews: payload?.restaurantParticipantReviews,
        restaurantParticipantReviewers: payload?.restaurantParticipantReviewers,
      }))
      .addCase(fetchRestaurantReviews.rejected, (state, { error }) => ({
        ...state,
        fetchRestaurantReviewInProgress: false,
        fetchRestaurantReviewError: error,
      }));
  },
});

export const BookerSelectRestaurantActions =
  BookerSelectRestaurantSlice.actions;

export default BookerSelectRestaurantSlice.reducer;
