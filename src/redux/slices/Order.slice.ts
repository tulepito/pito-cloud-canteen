import { companyApi } from '@apis/companyApi';
import { fetchUserApi } from '@apis/index';
import type { TUpdateOrderApiBody } from '@apis/orderApi';
import {
  bookerDeleteDraftOrderApi,
  createBookerOrderApi,
  queryOrdersApi,
  updateOrderApi,
  updatePlanDetailsApi,
} from '@apis/orderApi';
import { convertHHmmStringToTimeParts } from '@helpers/dateHelpers';
import { LISTING_TYPE } from '@pages/api/helpers/constants';
import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import { UserPermission } from '@src/types/UserPermission';
import { denormalisedResponseEntities, Listing, User } from '@utils/data';
import { convertWeekDay, getSeparatedDates } from '@utils/dates';
import { EListingStates, EOrderStates } from '@utils/enums';
import { storableError } from '@utils/errors';
import type { TListing, TObject, TPagination } from '@utils/types';
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

  orderDetail: any;
  fetchOrderDetailInProgress: boolean;
  fetchOrderDetailError: any;

  initiateTransactionsInProgress: boolean;
  initiateTransactionsError: any;

  // Manage Orders Page
  queryParams: TObject;
  orders: TListing[];
  queryOrderInProgress: boolean;
  queryOrderError: any;
  deleteDraftOrderInProgress: boolean;
  deleteDraftOrderError: any;
  totalItemMap: {
    [EOrderStates.picking]: number;
    [EOrderStates.completed]: number;
    [EOrderStates.isNew]: number;
    [EOrderStates.canceled]: number;
    all: number;
  };
  manageOrdersPagination: TPagination;
};

const CREATE_ORDER = 'app/Order/CREATE_ORDER';
const UPDATE_ORDER = 'app/Order/UPDATE_ORDER';
const FETCH_COMPANY_BOOKERS = 'app/Order/FETCH_COMPANY_BOOKERS';
const FETCH_ORDER = 'app/Order/FETCH_ORDER';
const FETCH_ORDER_DETAIL = 'app/Order/FETCH_ORDER_DETAIL';
const INITIATE_TRANSACTIONS = 'app/Order/INITIATE_TRANSACTIONS';
const QUERY_SUB_ORDERS = 'app/Order/QUERY_SUB_ORDERS';
const UPDATE_PLAN_DETAIL = 'app/Order/UPDATE_PLAN_DETAIL';

const initialState: TOrderInitialState = {
  order: null,
  fetchOrderInProgress: false,
  fetchOrderError: null,
  plans: [],
  orderDetail: {},
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

  selectedCalendarDate: undefined!,
  isSelectingRestaurant: false,

  updateOrderInProgress: false,
  updateOrderError: null,

  fetchOrderDetailInProgress: false,
  fetchOrderDetailError: null,

  initiateTransactionsInProgress: false,
  initiateTransactionsError: null,

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
    [EOrderStates.picking]: 0,
    [EOrderStates.completed]: 0,
    [EOrderStates.isNew]: 0,
    [EOrderStates.canceled]: 0,
    all: 0,
  },
};

const createOrder = createAsyncThunk(CREATE_ORDER, async (params: any) => {
  const { clientId, bookerId, isCreatedByAdmin = false } = params;
  const apiBody = {
    companyId: clientId,
    bookerId,
    isCreatedByAdmin,
  };
  const { data: orderListing } = await createBookerOrderApi(apiBody);
  return orderListing;
});

const updateOrder = createAsyncThunk(
  UPDATE_ORDER,
  async (params: any, { getState, dispatch }) => {
    const { order } = getState().Order;
    const { generalInfo, orderDetail: orderDetailParams } = params;
    const {
      deadlineDate,
      deadlineHour,
      packagePerMember,
      deliveryHour,
      nutritions,
    } = generalInfo || {};
    const orderId = Listing(order as TListing).getId();
    const orderDetail: any = {};
    if (!orderDetailParams) {
      const { dayInWeek = [], startDate, endDate } = generalInfo;
      const totalDates = getSeparatedDates(startDate, endDate);
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
                  id: Listing(restaurants[0]?.restaurantInfo).getId(),
                  restaurantName: Listing(
                    restaurants[randomNumber]?.restaurantInfo,
                  ).getAttributes().title,
                  foodList: [],
                },
              };
            }
          }
        }),
      );
    }
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
      orderDetail: orderDetailParams || orderDetail,
    };
    const { data: orderListing } = await updateOrderApi(orderId, apiBody);
    return orderListing;
  },
);

const initiateTransactions = createAsyncThunk(
  INITIATE_TRANSACTIONS,
  async (_) => {
    // await initiateTransactionsApi(params);
    return '';
  },
);

const queryOrders = createAsyncThunk(
  QUERY_SUB_ORDERS,
  async (payload: TObject = {}) => {
    const params = {
      dataParams: {
        ...payload,
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
  async (payload: TObject, { rejectWithValue }) => {
    const { companyId = '', ...restPayload } = payload;

    if (companyId === '') {
      return rejectWithValue('Company ID is empty');
    }
    const params = {
      dataParams: {
        ...restPayload,
        states: EListingStates.published,
        perPage: MANAGE_ORDER_PAGE_SIZE,
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
  async (_, { getState, extra: sdk }) => {
    const { order } = getState().Order;

    const { plans = [] } = Listing(order as TListing).getMetadata();
    if (plans[0]) {
      const response = denormalisedResponseEntities(
        await sdk.listings.show({
          id: plans[0],
        }),
      )[0];
      return Listing(response).getMetadata().orderDetail;
    }
    return {};
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
);

export const orderAsyncActions = {
  createOrder,
  updateOrder,
  bookerDeleteDraftOrder,
  fetchCompanyBookers,
  fetchOrder,
  fetchOrderDetail,
  initiateTransactions,
  queryOrders,
  queryCompanyOrders,
  updatePlanDetail,
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
      const { dateTimestamp, restaurantId, restaurantName, foodList } =
        orderDetail;
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => ({
        ...state,
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
        order: payload,
      }))
      .addCase(updateOrder.rejected, (state, { error }) => ({
        ...state,
        updateOrderInProgress: false,
        updateOrderError: error.message,
      }))

      .addCase(initiateTransactions.pending, (state) => ({
        ...state,
        initiateTransactionsError: null,
        initiateTransactionsInProgress: true,
      }))
      .addCase(initiateTransactions.fulfilled, (state) => ({
        ...state,
        initiateTransactionsInProgress: false,
      }))
      .addCase(initiateTransactions.rejected, (state, { payload }) => ({
        ...state,
        initiateTransactionsInProgress: false,
        initiateTransactionsError: payload,
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
        state.deleteDraftOrderInProgress = false;
        state.queryOrderError = null;
      })
      .addCase(bookerDeleteDraftOrder.fulfilled, (state) => {
        state.deleteDraftOrderInProgress = true;
      })
      .addCase(bookerDeleteDraftOrder.rejected, (state, { payload }) => {
        state.deleteDraftOrderInProgress = false;
        state.queryOrderError = payload;
      })
      .addCase(updatePlanDetail.pending, (state) => ({
        ...state,
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
} = orderSlice.actions;

export default orderSlice.reducer;
