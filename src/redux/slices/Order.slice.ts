import { companyApi } from '@apis/companyApi';
import { fetchUserApi } from '@apis/index';
import type { TUpdateOrderApiBody } from '@apis/orderApi';
import {
  bookerCancelPendingApprovalOrderApi,
  bookerDeleteDraftOrderApi,
  bookerPublishOrderApi,
  createBookerOrderApi,
  queryOrdersApi,
  requestApprovalOrderApi,
  updateOrderApi,
  updatePlanDetailsApi,
} from '@apis/orderApi';
import { convertHHmmStringToTimeParts } from '@helpers/dateHelpers';
import { LISTING_TYPE } from '@pages/api/helpers/constants';
import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import { UserPermission } from '@src/types/UserPermission';
import { denormalisedResponseEntities, Listing, User } from '@utils/data';
import { convertWeekDay, renderDateRange } from '@utils/dates';
import { EListingStates, EManageCompanyOrdersTab } from '@utils/enums';
import { storableError } from '@utils/errors';
import type { TListing, TObject, TPagination } from '@utils/types';
import uniq from 'lodash/uniq';
import { DateTime } from 'luxon';

import { selectRestaurantPageThunks } from './SelectRestaurantPage.slice';

export const MANAGE_ORDER_PAGE_SIZE = 10;

type TOrderInitialState = {
  order: TListing | null;
  fetchOrderInProgress: boolean;
  fetchOrderError: any;
  plans: TListing[];

  createOrderInProcess: boolean;
  createOrderError: any;

  completeOrderInProgress: boolean;
  completeOrderError: any;
  draftOrder: any;
  selectedCompany: any;

  fetchBookersInProgress: boolean;
  fetchBookersError: any;
  bookerList: any[];
  selectedBooker: any;

  selectedCalendarDate: Date;
  isSelectingRestaurant: boolean;

  updateOrderInProgress: boolean;
  updateOrderError: any;

  updateOrderDetailInProgress: boolean;
  updateOrderDetailError: any;

  orderDetail: any;
  justDeletedMemberOrder: boolean;
  fetchOrderDetailInProgress: boolean;
  fetchOrderDetailError: any;

  bookerPublishOrderInProgress: boolean;
  bookerPublishOrderError: any;

  // Manage Orders Page
  queryParams: TObject;
  orders: TListing[];
  queryOrderInProgress: boolean;
  queryOrderError: any;
  deleteDraftOrderInProgress: boolean;
  deleteDraftOrderError: any;
  manageOrdersPagination: TPagination;

  totalItemMap: {
    [EManageCompanyOrdersTab.SCHEDULED]: number;
    [EManageCompanyOrdersTab.CANCELED]: number;
    [EManageCompanyOrdersTab.DRAFT]: number;
    [EManageCompanyOrdersTab.COMPLETED]: number;
    [EManageCompanyOrdersTab.ALL]: number;
  };

  restaurantCoverImageList: {
    [restaurantId: string]: any;
  };
  fetchRestaurantCoverImageInProgress: boolean;
  fetchRestaurantCoverImageError: any;

  recommendRestaurantInProgress: boolean;
  recommendRestaurantError: any;

  step2SubmitInProgress: boolean;
};

const initialState: TOrderInitialState = {
  order: null,
  fetchOrderInProgress: false,
  fetchOrderError: null,
  plans: [] as TListing[],
  orderDetail: {},
  justDeletedMemberOrder: false,
  createOrderInProcess: false,
  createOrderError: null,

  completeOrderInProgress: false,
  completeOrderError: null,
  draftOrder: {},
  selectedCompany: null,

  fetchBookersInProgress: false,
  fetchBookersError: null,
  bookerList: [],
  selectedBooker: null,

  updateOrderDetailInProgress: false,
  updateOrderDetailError: null,

  selectedCalendarDate: undefined!,
  isSelectingRestaurant: false,

  updateOrderInProgress: false,
  updateOrderError: null,

  fetchOrderDetailInProgress: false,
  fetchOrderDetailError: null,

  bookerPublishOrderInProgress: false,
  bookerPublishOrderError: null,

  // Manage Orders
  queryParams: {},
  orders: [],
  queryOrderInProgress: false,
  queryOrderError: null,
  deleteDraftOrderInProgress: false,
  deleteDraftOrderError: null,
  manageOrdersPagination: {
    totalItems: 0,
    totalPages: 0,
    page: 0,
    perPage: 0,
  },
  totalItemMap: {
    [EManageCompanyOrdersTab.SCHEDULED]: 0,
    [EManageCompanyOrdersTab.CANCELED]: 0,
    [EManageCompanyOrdersTab.DRAFT]: 0,
    [EManageCompanyOrdersTab.COMPLETED]: 0,
    [EManageCompanyOrdersTab.ALL]: 0,
  },

  restaurantCoverImageList: {},
  fetchRestaurantCoverImageInProgress: false,
  fetchRestaurantCoverImageError: null,

  recommendRestaurantInProgress: false,
  recommendRestaurantError: null,
  step2SubmitInProgress: false,
};

const CREATE_ORDER = 'app/Order/CREATE_ORDER';
const UPDATE_ORDER = 'app/Order/UPDATE_ORDER';
const FETCH_COMPANY_BOOKERS = 'app/Order/FETCH_COMPANY_BOOKERS';
const FETCH_ORDER = 'app/Order/FETCH_ORDER';
const FETCH_ORDER_DETAIL = 'app/Order/FETCH_ORDER_DETAIL';
const QUERY_SUB_ORDERS = 'app/Order/QUERY_SUB_ORDERS';
const UPDATE_PLAN_DETAIL = 'app/Order/UPDATE_PLAN_DETAIL';
const FETCH_PLAN_DETAIL = 'app/Order/FETCH_PLAN_DETAIL';
const FETCH_RESTAURANT_COVER_IMAGE = 'app/Order/FETCH_RESTAURANT_COVER_IMAGE';
const RECOMMEND_RESTAURANT = 'app/Order/RECOMMEND_RESTAURANT';

const createOrder = createAsyncThunk(CREATE_ORDER, async (params: any) => {
  const { clientId, bookerId, isCreatedByAdmin = false, generalInfo } = params;
  const apiBody = {
    companyId: clientId,
    bookerId,
    isCreatedByAdmin,
    generalInfo,
  };
  const { data: orderListing } = await createBookerOrderApi(apiBody);

  return orderListing;
});

const updateOrder = createAsyncThunk(
  UPDATE_ORDER,
  async (params: any, { getState }) => {
    const { order } = getState().Order;
    const { generalInfo } = params;
    const { deadlineDate, deadlineHour } = generalInfo || {};
    const orderId = Listing(order as TListing).getId();
    const parsedDeadlineDate = deadlineDate
      ? DateTime.fromMillis(deadlineDate)
          .startOf('day')
          .plus({
            ...convertHHmmStringToTimeParts(deadlineHour),
          })
          .toMillis()
      : null;

    const apiBody: TUpdateOrderApiBody = {
      generalInfo: {
        ...generalInfo,
        ...(parsedDeadlineDate ? { deadlineDate: parsedDeadlineDate } : {}),
      },
    };
    const { data: orderListing } = await updateOrderApi(orderId, apiBody);

    return {
      orderListing,
    };
  },
);

const recommendRestaurants = createAsyncThunk(
  RECOMMEND_RESTAURANT,
  async (_, { getState, dispatch }) => {
    const { order } = getState().Order;
    const orderDetail: any = {};
    const {
      packagePerMember,
      deliveryHour,
      nutritions = [],
      dayInWeek = [],
      startDate,
      endDate,
    } = Listing(order as TListing).getMetadata();
    const totalDates = renderDateRange(startDate, endDate);
    await Promise.all(
      totalDates.map(async (dateTime) => {
        if (
          dayInWeek.includes(
            convertWeekDay(DateTime.fromMillis(dateTime).weekday).key,
          )
        ) {
          const { payload }: { payload: any } = await dispatch(
            selectRestaurantPageThunks.getRestaurants({
              dateTime: DateTime.fromMillis(dateTime),
              packagePerMember,
              deliveryHour,
              nutritions,
            }),
          );
          const { restaurants = [] } = payload || {};
          if (restaurants.length > 0) {
            const randomNumber = Math.floor(
              Math.random() * (restaurants.length - 1),
            );

            orderDetail[dateTime] = {
              restaurant: {
                id: Listing(restaurants[randomNumber]?.restaurantInfo).getId(),
                restaurantName: Listing(
                  restaurants[randomNumber]?.restaurantInfo,
                ).getAttributes().title,
                foodList: [],
                menuId: restaurants[randomNumber]?.menu.id.uuid,
              },
            };
          }
        }
      }),
    );

    return orderDetail;
  },
);

const queryOrders = createAsyncThunk(
  QUERY_SUB_ORDERS,
  async (payload: TObject = {}) => {
    const params = {
      dataParams: {
        ...payload,
        states: EListingStates.published,
        perPage: MANAGE_ORDER_PAGE_SIZE,
      },
      queryParams: {
        expand: true,
      },
    };
    const { data } = await queryOrdersApi(params);
    const { orders, pagination } = data;

    return { orders, pagination };
  },
  {
    serializeError: storableError,
  },
);

const queryCompanyOrders = createAsyncThunk(
  'app/Orders/COMPANY_QUERY_ORDERS',
  async (payload: TObject, { rejectWithValue, extra: sdk }) => {
    const { companyId = '', ...restPayload } = payload;

    if (companyId === '') {
      return rejectWithValue('Company ID is empty');
    }

    const bookerId = denormalisedResponseEntities(
      await sdk.currentUser.show(),
    )[0]?.id?.uuid;

    const params = {
      dataParams: {
        ...restPayload,
        perPage: MANAGE_ORDER_PAGE_SIZE,
        states: EListingStates.published,
        meta_bookerId: bookerId,
        meta_companyId: companyId,
        meta_listingType: LISTING_TYPE.ORDER,
      },
      queryParams: {
        expand: true,
      },
    };
    const { data } = await companyApi.queryOrdersApi(companyId, params);
    const { orders, pagination, totalItemMap } = data;

    return { orders, pagination, totalItemMap, queryParams: payload };
  },
  {
    serializeError: storableError,
  },
);

const fetchCompanyBookers = createAsyncThunk(
  FETCH_COMPANY_BOOKERS,
  async (companyId: string, { extra: sdk }) => {
    const companyAccount = denormalisedResponseEntities(
      await sdk.users.show(
        {
          id: companyId,
        },
        { expand: true },
      ),
    )[0];
    const { members = {} } = User(companyAccount).getMetadata();
    const bookerEmails = Object.keys(members).filter(
      (email) => members[email].permission === UserPermission.BOOKER,
    );
    const bookers = await Promise.all(
      bookerEmails.map(async (email) => {
        const { data } = await fetchUserApi(members[email].id);

        return data;
      }),
    );

    return bookers;
  },
);

const fetchOrderDetail = createAsyncThunk(
  FETCH_ORDER_DETAIL,
  async (plans: string[], { extra: sdk }) => {
    if (plans?.length > 0) {
      const response: any = denormalisedResponseEntities(
        await sdk.listings.show({
          id: plans[0],
        }),
      )[0];

      return Listing(response).getMetadata().orderDetail;
    }

    return {};
  },
);

const fetchRestaurantCoverImages = createAsyncThunk(
  FETCH_RESTAURANT_COVER_IMAGE,
  async (_, { extra: sdk, getState }) => {
    const { orderDetail } = getState().Order;
    const restaurantIdList = uniq(
      Object.values(orderDetail).map((item: any) => item.restaurant.id),
    );
    const restaurantCoverImageList = await Promise.all(
      restaurantIdList.map(async (restaurantId) => {
        const restaurantResponse = denormalisedResponseEntities(
          await sdk.listings.show({
            id: restaurantId,
            include: ['images'],
            'fields.image': [
              'variants.landscape-crop',
              'variants.landscape-crop2x',
            ],
          }),
        )[0];
        const { coverImageId } = Listing(restaurantResponse).getPublicData();

        return {
          [restaurantId]: Listing(restaurantResponse)
            .getFullData()
            .images.find((image: any) => image.id.uuid === coverImageId),
        };
      }),
    );

    return restaurantCoverImageList.reduce(
      (result, item) => ({
        ...result,
        ...item,
      }),
      {},
    );
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

    const { bookerId } = Listing(response).getMetadata();
    const selectedBooker = denormalisedResponseEntities(
      await sdk.users.show({
        id: bookerId,
      }),
    )[0];

    return { order: response, selectedBooker };
  },
);

const fetchPlanDetail = createAsyncThunk(
  FETCH_PLAN_DETAIL,
  async ({ planId }: { planId: string }, { extra: sdk }) => {
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
  async ({ orderId, planId, orderDetail, updateMode }: any, _) => {
    const { data: orderListing } = await updatePlanDetailsApi(orderId, {
      orderDetail,
      planId,
      updateMode,
    });

    return orderListing;
  },
);

const bookerDeleteDraftOrder = createAsyncThunk(
  'app/Order/DELETE_DRAFT_ORDER',
  async ({ orderId, companyId }: TObject, { getState, dispatch }) => {
    const { queryParams } = getState().Order;

    await bookerDeleteDraftOrderApi({ orderId, companyId });
    await dispatch(queryCompanyOrders(queryParams));
  },
  {
    serializeError: storableError,
  },
);

const requestApprovalOrder = createAsyncThunk(
  'app/Order/REQUEST_APPROVAL_ORDER',
  async ({ orderId }: TObject) => {
    const { data: responseData } = await requestApprovalOrderApi(orderId);

    return responseData.data;
  },
);

const cancelPendingApprovalOrder = createAsyncThunk(
  'app/Order/CANCEL_PENDING_APPROVAL_ORDER',
  async ({ orderId }: TObject, { getState, dispatch }) => {
    const { queryParams } = getState().Order;

    const { data: responseData } = await bookerCancelPendingApprovalOrderApi(
      orderId,
    );

    await dispatch(queryCompanyOrders(queryParams));
    return responseData.data;
  },
);

const bookerPublishOrder = createAsyncThunk(
  'app/Order/BOOKER_PUBLISH_ORDER',
  async ({ orderId }: TObject) => {
    await bookerPublishOrderApi(orderId as string);
  },
  {
    serializeError: storableError,
  },
);

export const orderAsyncActions = {
  createOrder,
  updateOrder,
  bookerDeleteDraftOrder,
  fetchCompanyBookers,
  fetchOrder,
  fetchOrderDetail,
  queryOrders,
  queryCompanyOrders,
  fetchPlanDetail,
  updatePlanDetail,
  requestApprovalOrder,
  bookerPublishOrder,
  cancelPendingApprovalOrder,
  fetchRestaurantCoverImages,
  recommendRestaurants,
};

const orderSlice = createSlice({
  name: 'Order',
  initialState,
  reducers: {
    addCompanyClient: (state, { payload }) => {
      return {
        ...state,
        draftOrder: {
          ...state.draftOrder,
          clientId: payload.id,
        },
        selectedCompany: payload.company,
      };
    },
    addBooker: (state, { payload }) => ({
      ...state,
      selectedBooker: payload,
    }),
    updateDraftMealPlan: (state, { payload }) => {
      const { orderDetail } = payload;
      const {
        dateTimestamp,
        restaurantId,
        restaurantName,
        foodList,
        phoneNumber,
      } = orderDetail;
      const { orderDetail: oldOrderDetail } = state;
      const existedOrderDetailDate = Object.keys(oldOrderDetail).includes(
        dateTimestamp.toString(),
      );

      const updatedOrderDetailData = existedOrderDetailDate
        ? {
            ...oldOrderDetail,
            [dateTimestamp]: {
              ...oldOrderDetail[dateTimestamp],
              restaurant: {
                ...oldOrderDetail[dateTimestamp].restaurant,
                id: restaurantId,
                restaurantName,
                foodList,
                phoneNumber,
              },
            },
          }
        : {
            ...oldOrderDetail,
            [dateTimestamp]: {
              restaurant: {
                id: restaurantId,
                foodList,
                restaurantName,
              },
            },
          };

      return {
        ...state,
        orderDetail: updatedOrderDetailData,
      };
    },
    removeMealDay: (state, { payload }) => ({
      ...state,
      justDeletedMemberOrder: true,
      orderDetail: payload,
    }),
    selectCalendarDate: (state, { payload }) => ({
      ...state,
      selectedCalendarDate: payload,
    }),
    selectRestaurant: (state) => ({
      ...state,
      isSelectingRestaurant: true,
    }),
    unSelectRestaurant: (state) => ({
      ...state,
      isSelectingRestaurant: false,
    }),
    removeDraftOrder: (state) => ({
      ...state,
      draftOrder: {},
    }),
    removeBookerList: (state) => ({
      ...state,
      bookerList: [],
    }),
    resetOrder: (state) => ({
      ...state,
      order: null,
      orderDetail: {},
      selectedBooker: null,
    }),
    changeStep2SubmitStatus: (state, { payload }) => ({
      ...state,
      step2SubmitInProgress: payload,
    }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => ({
        ...state,
        justDeletedMemberOrder: false,
        createOrderInProcess: true,
        createOrderError: null,
      }))
      .addCase(createOrder.fulfilled, (state, { payload }) => ({
        ...state,
        createOrderInProcess: false,
        order: payload,
      }))
      .addCase(createOrder.rejected, (state, { error }) => ({
        ...state,
        createOrderError: error.message,
        createOrderInProcess: false,
      }))

      .addCase(updateOrder.pending, (state) => ({
        ...state,
        updateOrderInProgress: true,
        updateOrderError: null,
      }))
      .addCase(updateOrder.fulfilled, (state, { payload }) => ({
        ...state,
        updateOrderInProgress: false,
        order: payload.orderListing,
      }))
      .addCase(updateOrder.rejected, (state, { error }) => ({
        ...state,
        updateOrderInProgress: false,
        updateOrderError: error.message,
      }))
      .addCase(queryOrders.pending, (state) => ({
        ...state,
        queryOrderInProgress: true,
        queryOrderError: null,
      }))
      .addCase(
        queryOrders.fulfilled,
        (state, { payload: { orders, pagination } }) => ({
          ...state,
          queryOrderInProgress: false,
          orders,
          manageOrdersPagination: pagination,
        }),
      )
      .addCase(queryOrders.rejected, (state, { payload }) => ({
        ...state,
        queryOrderInProgress: false,
        queryOrderError: payload,
      }))

      .addCase(fetchCompanyBookers.pending, (state) => ({
        ...state,
        fetchBookersInProgress: true,
        fetchBookersError: null,
      }))
      .addCase(fetchCompanyBookers.fulfilled, (state, { payload }) => ({
        ...state,
        fetchBookersInProgress: false,
        bookerList: payload,
      }))
      .addCase(fetchCompanyBookers.rejected, (state, { error }) => ({
        ...state,
        fetchBookersInProgress: false,
        fetchBookersError: error.message,
      }))

      .addCase(fetchOrder.pending, (state) => ({
        ...state,
        justDeletedMemberOrder: false,
        fetchOrderInProgress: true,
        fetchOrderError: null,
      }))
      .addCase(fetchOrder.fulfilled, (state, { payload }) => ({
        ...state,
        fetchOrderInProgress: false,
        order: payload.order,
        selectedBooker: payload.selectedBooker,
      }))
      .addCase(fetchOrder.rejected, (state, { error }) => ({
        ...state,
        fetchOrderInProgress: false,
        fetchOrderError: error.message,
      }))

      .addCase(fetchOrderDetail.pending, (state) => ({
        ...state,
        fetchOrderDetailInProgress: true,
        fetchOrderDetailError: null,
      }))
      .addCase(fetchOrderDetail.fulfilled, (state, { payload }) => ({
        ...state,
        fetchOrderDetailInProgress: false,
        orderDetail: payload,
      }))
      .addCase(fetchOrderDetail.rejected, (state, { error }) => ({
        ...state,
        fetchOrderDetailInProgress: false,
        fetchOrderDetailError: error.message,
      }))
      /* =============== queryCompanyOrders =============== */
      .addCase(queryCompanyOrders.pending, (state) => {
        state.queryOrderInProgress = true;
        state.queryOrderError = null;
      })
      .addCase(
        queryCompanyOrders.fulfilled,
        (
          state,
          { payload: { orders, pagination, totalItemMap, queryParams } },
        ) => ({
          ...state,
          queryParams,

          queryOrderInProgress: false,
          orders,
          manageOrdersPagination: pagination,
          totalItemMap,
        }),
      )
      .addCase(queryCompanyOrders.rejected, (state, { payload }) => {
        state.queryOrderInProgress = false;
        state.queryOrderError = payload;
      })
      /* =============== bookerDeleteDraftOrder =============== */
      .addCase(bookerDeleteDraftOrder.pending, (state) => {
        state.deleteDraftOrderInProgress = true;
        state.queryOrderError = null;
      })
      .addCase(bookerDeleteDraftOrder.fulfilled, (state) => {
        state.deleteDraftOrderInProgress = false;
      })
      .addCase(bookerDeleteDraftOrder.rejected, (state, { payload }) => {
        state.deleteDraftOrderInProgress = false;
        state.queryOrderError = payload;
      })
      .addCase(updatePlanDetail.pending, (state) => ({
        ...state,
        justDeletedMemberOrder: false,
        updateOrderDetailInProgress: true,
        updateOrderDetailError: null,
      }))
      .addCase(updatePlanDetail.fulfilled, (state, { payload }) => ({
        ...state,
        updateOrderDetailInProgress: false,
        orderDetail: Listing(payload).getMetadata().orderDetail || {},
      }))
      .addCase(updatePlanDetail.rejected, (state, { error }) => ({
        ...state,
        updateOrderDetailInProgress: false,
        updateOrderDetailError: error.message,
      }))
      /* =============== requestApprovalOrder =============== */
      .addCase(requestApprovalOrder.pending, (state) => ({
        ...state,
        updateOrderInProgress: true,
        updateOrderError: null,
      }))
      .addCase(requestApprovalOrder.fulfilled, (state, { payload }) => ({
        ...state,
        updateOrderInProgress: false,
        order: payload,
      }))
      .addCase(requestApprovalOrder.rejected, (state, { error }) => ({
        ...state,
        updateOrderInProgress: false,
        updateOrderError: error.message,
      }))
      /* =============== cancelNeedApprovalOrder =============== */
      .addCase(cancelPendingApprovalOrder.pending, (state) => ({
        ...state,
        updateOrderInProgress: true,
        updateOrderError: null,
      }))
      .addCase(cancelPendingApprovalOrder.fulfilled, (state, { payload }) => ({
        ...state,
        updateOrderInProgress: false,
        order: payload,
      }))
      .addCase(cancelPendingApprovalOrder.rejected, (state, { error }) => ({
        ...state,
        updateOrderInProgress: false,
        updateOrderError: error.message,
      }))
      /* =============== bookerPublishOrder =============== */
      .addCase(bookerPublishOrder.pending, (state) => {
        state.bookerPublishOrderError = null;
        state.bookerPublishOrderInProgress = true;
      })
      .addCase(bookerPublishOrder.fulfilled, (state) => {
        state.bookerPublishOrderInProgress = false;
      })
      .addCase(bookerPublishOrder.rejected, (state, { payload }) => {
        state.bookerPublishOrderInProgress = false;
        state.bookerPublishOrderError = payload;
      })

      .addCase(fetchRestaurantCoverImages.pending, (state) => ({
        ...state,
        fetchRestaurantCoverImageInProgress: true,
        fetchRestaurantCoverImageError: null,
      }))
      .addCase(fetchRestaurantCoverImages.fulfilled, (state, { payload }) => ({
        ...state,
        fetchRestaurantCoverImageInProgress: false,
        restaurantCoverImageList: payload,
      }))
      .addCase(fetchRestaurantCoverImages.rejected, (state, { error }) => ({
        ...state,
        fetchRestaurantCoverImageInProgress: false,
        fetchRestaurantCoverImageError: error.message,
      }))

      .addCase(recommendRestaurants.pending, (state) => ({
        ...state,
        recommendRestaurantInProgress: true,
        recommendRestaurantError: null,
      }))
      .addCase(recommendRestaurants.fulfilled, (state) => ({
        ...state,
        recommendRestaurantInProgress: false,
      }))
      .addCase(recommendRestaurants.rejected, (state, { error }) => ({
        ...state,
        recommendRestaurantInProgress: false,
        recommendRestaurantError: error.message,
      }));
  },
});

export const {
  addCompanyClient,
  updateDraftMealPlan,
  removeDraftOrder,
  removeBookerList,
  addBooker,
  removeMealDay,
  selectCalendarDate,
  selectRestaurant,
  unSelectRestaurant,
  resetOrder,
  changeStep2SubmitStatus,
} = orderSlice.actions;

export default orderSlice.reducer;
