import { createSlice } from '@reduxjs/toolkit';
import chunk from 'lodash/chunk';
import flatten from 'lodash/flatten';
import keyBy from 'lodash/keyBy';
import mapValue from 'lodash/mapValues';
import uniq from 'lodash/uniq';
import uniqBy from 'lodash/uniqBy';

import { fetchFoodListFromMenuApi } from '@apis/admin';
import { updatePlanDetailsApi } from '@apis/orderApi';
import { queryAllPages } from '@helpers/apiHelpers';
import type { TMenuQueryParams } from '@helpers/listingSearchQuery';
import { getMenuQuery, getRestaurantQuery } from '@helpers/listingSearchQuery';
import { calculateDistance } from '@helpers/mapHelpers';
import { createAsyncThunk } from '@redux/redux.helper';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { CompanyPermissions } from '@src/types/UserPermission';
import { denormalisedResponseEntities, Listing } from '@utils/data';
import { ECompanyPermission, EImageVariants, EListingType } from '@utils/enums';
import type { TListing, TObject, TPagination, TUser } from '@utils/types';

export const MANAGE_ORDER_PAGE_SIZE = 10;

// ================ Initial states ================ //
type TOrderInitialState = {
  restaurant: TListing | null;
  restaurantIdList: string[];

  searchResult: TListing[];
  totalItems: number;
  combinedRestaurantMenuData: {
    restaurantId: string;
    menuId: string;
  }[];

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
  bookerReviewPagination: TPagination;

  restaurantParticipantReviews: any;
  restaurantParticipantReviewers: any;
  participantReviewPagination: TPagination;

  fetchRestaurantReviewInProgress: boolean;
  fetchRestaurantReviewError: any;
};

const initialState: TOrderInitialState = {
  restaurant: null,
  restaurantIdList: [],

  searchResult: [],
  totalItems: 0,
  combinedRestaurantMenuData: [],

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
  bookerReviewPagination: null!,

  restaurantParticipantReviews: [],
  restaurantParticipantReviewers: [],
  participantReviewPagination: null!,

  fetchRestaurantReviewInProgress: false,
  fetchRestaurantReviewError: null,

  selectedRestaurantId: '',
};

// ================ Thunk types ================ //
const FETCH_RESTAURANT = 'app/BookerSelectRestaurant/FETCH_RESTAURANT';
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
  async (restaurantId: string, { extra: sdk, getState }) => {
    const {
      restaurantIdList = [],
      searchResult = [],
      totalItems,
    } = getState().BookerSelectRestaurant;
    if (restaurantId) {
      const isRestaurantExisted = restaurantIdList.includes(restaurantId);

      if (isRestaurantExisted)
        return {
          restaurant: searchResult.find(
            (restaurant) => restaurant.id.uuid === restaurantId,
          ),
          restaurantIdList,
          searchResult,
          totalItems,
        };

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

      return {
        restaurant: response,
        restaurantIdList: restaurantIdList.concat(restaurantId),
        searchResult: uniqBy(searchResult.concat(response), 'id.uuid'),
        totalItems: totalItems + 1,
      };
    }

    return {
      restaurant: null,
      restaurantIdList,
      searchResult,
      totalItems,
    };
  },
);

const searchRestaurants = createAsyncThunk(
  SEARCH_RESTAURANT,
  async (params: TMenuQueryParams, { extra: sdk, getState, dispatch }) => {
    const { orderId, timestamp } = params;

    await dispatch(orderAsyncActions.fetchOrder(orderId!));
    const { order } = getState().Order;
    const { companyAccount } = getState().BookerSelectRestaurant;

    // eslint-disable-next-line unused-imports/no-unused-vars
    const { keywords, ...queryWithoutKeywords } = params;
    const query = getMenuQuery({ order, params: queryWithoutKeywords });
    const orderListing = Listing(order);
    const {
      memberAmount = 0,
      startDate,
      endDate,
      deliveryAddress = {},
    } = orderListing.getMetadata();

    const allMenus = await queryAllPages({ sdkModel: sdk.listings, query });

    const combinedRestaurantMenuData = allMenus.map((menu: TListing) => ({
      restaurantId: Listing(menu).getMetadata()?.restaurantId,
      menuId: menu.id.uuid,
    }));

    const newRestaurantIds = uniqBy<{ restaurantId: string; menuId: string }>(
      combinedRestaurantMenuData,
      'restaurantId',
    ).map((item) => item.restaurantId);
    const totalRestaurantIds = uniq([...newRestaurantIds]);
    const slicedRestaurantIdsBy100 = chunk(totalRestaurantIds, 100);

    const restaurantQueries = slicedRestaurantIdsBy100.map((restaurantIds) =>
      getRestaurantQuery({
        restaurantIds,
        companyAccount,
        params: {
          ...params,
          memberAmount,
          startDate,
          endDate,
        },
      }),
    );

    const restaurantsResponse = await Promise.all(
      restaurantQueries.map(async (restaurantQuery) => {
        const response = await sdk.listings.query(restaurantQuery);
        const { meta: chunkRestaurantResponseMeta } = response.data;

        return {
          chunkRestaurantsResponse: denormalisedResponseEntities(response),
          chunkRestaurantResponseMeta,
        };
      }),
    );

    const searchResult = flatten(
      restaurantsResponse.map(
        ({ chunkRestaurantsResponse }) => chunkRestaurantsResponse,
      ),
    ).filter((r: TListing) => {
      const restaurantGetter = Listing(r);

      const {
        stopReceiveOrder = false,
        startStopReceiveOrderDate = 0,
        endStopReceiveOrderDate = 0,
      } = Listing(r).getPublicData();
      const isInStopReceiveOrderTime =
        stopReceiveOrder &&
        Number(timestamp) >= startStopReceiveOrderDate &&
        Number(timestamp) <= endStopReceiveOrderDate;

      const { geolocation: restaurantOrigin } =
        restaurantGetter.getAttributes();

      const distanceToDeliveryPlace = calculateDistance(
        deliveryAddress?.origin,
        restaurantOrigin,
      );
      const isValidRestaurant =
        !isInStopReceiveOrderTime &&
        distanceToDeliveryPlace <=
          Number(
            process.env
              .NEXT_PUBLIC_MAX_KILOMETER_FROM_RESTAURANT_TO_DELIVERY_ADDRESS_FOR_BOOKER,
          );

      return isValidRestaurant;
    });

    return {
      ...(newRestaurantIds.length > 0 && {
        restaurantIdList: newRestaurantIds,
      }),
      searchResult,
      combinedRestaurantMenuData,
      totalItems: searchResult.length,
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
  async (params: Record<string, any>, { getState, dispatch }) => {
    const { combinedRestaurantMenuData = [], restaurantFood = {} } =
      getState().BookerSelectRestaurant;
    const {
      menuId: menuIdParam,
      timestamp,
      favoriteFoodIdList = [],
      restaurantId,
    } = params;
    const { order } = getState().BookerSelectRestaurant;
    const { nutritions = [] } = Listing(order as TListing).getMetadata();
    const menuId =
      menuIdParam ||
      combinedRestaurantMenuData.find(
        (item: TObject) => item.restaurantId === restaurantId,
      )?.menuId;

    const { data: foodList } = await fetchFoodListFromMenuApi({
      menuId,
      subOrderDate: timestamp,
      favoriteFoodIdList,
      nutritions,
    });

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
  async (
    { page = 1, reviewRole, isViewAll }: any,
    { extra: sdk, getState },
  ) => {
    const {
      selectedRestaurantId,
      restaurantBookerReviews,
      restaurantBookerReviewers,
      restaurantParticipantReviews,
      restaurantParticipantReviewers,
    } = getState().BookerSelectRestaurant;
    const rawResponse = await sdk.listings.query({
      meta_listingType: EListingType.rating,
      meta_restaurantId: selectedRestaurantId,
      page,
      perPage: isViewAll ? 10 : 5,
      meta_reviewRole: reviewRole,
    });
    const { meta } = rawResponse.data;

    const fetchedReviews = denormalisedResponseEntities(rawResponse);

    const reviewerIdList = fetchedReviews.map(
      (item: TListing) => Listing(item).getMetadata().reviewerId,
    );

    const reviewers = denormalisedResponseEntities(
      await sdk.users.query({
        meta_id: reviewerIdList,
      }),
    );

    const reviewerWithReviewIdList = fetchedReviews.fetchedReviews.map(
      (review: TListing) => {
        const reviewGetter = Listing(review);
        const reviewId = reviewGetter.getId();
        const { reviewerId } = reviewGetter.getMetadata();

        const suitableReviewer = reviewers.find(
          (reviewer: TUser) => reviewer.id.uuid === reviewerId,
        );

        return {
          id: reviewId,
          value: suitableReviewer,
        };
      },
    );

    return {
      ...(CompanyPermissions.includes(reviewRole) && {
        restaurantBookerReviews: isViewAll
          ? uniqBy([...restaurantBookerReviews, ...fetchedReviews], 'id.uuid')
          : fetchedReviews,
        restaurantBookerReviewers: isViewAll
          ? {
              ...restaurantBookerReviewers,
              ...mapValue(keyBy(reviewerWithReviewIdList, 'id'), 'value'),
            }
          : mapValue(keyBy(reviewerWithReviewIdList, 'id'), 'value'),
        bookerReviewPagination: meta,
      }),
      ...(reviewRole === ECompanyPermission.participant && {
        restaurantParticipantReviews: isViewAll
          ? uniqBy(
              [...restaurantParticipantReviews, ...fetchedReviews],
              'id.uuid',
            )
          : fetchedReviews,
        restaurantParticipantReviewers: isViewAll
          ? {
              ...restaurantParticipantReviewers,
              ...mapValue(keyBy(reviewerWithReviewIdList, 'id'), 'value'),
            }
          : mapValue(keyBy(reviewerWithReviewIdList, 'id'), 'value'),
        participantReviewPagination: meta,
      }),
    };
  },
);

export const BookerSelectRestaurantThunks = {
  fetchRestaurant,
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
        restaurant: payload?.restaurant,
        restaurantIdList: payload?.restaurantIdList,
        searchResult: payload?.searchResult,
        totalItems: payload?.totalItems,
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
        bookerReviewPagination: payload?.bookerReviewPagination,
        participantReviewPagination: payload?.participantReviewPagination,
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
