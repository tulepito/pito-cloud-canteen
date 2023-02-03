import { fetchUserApi } from '@apis/index';
import {
  createOrderApi,
  initiateTransactionsApi,
  queryOrdersApi,
  updateOrderApi,
} from '@apis/orderApi';
import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import { UserPermission } from '@src/types/UserPermission';
import { denormalisedResponseEntities, LISTING, USER } from '@utils/data';
import { storableError } from '@utils/errors';
import type { TListing, TPagination } from '@utils/types';
import cloneDeep from 'lodash/cloneDeep';

export const MANAGE_ORDER_PAGE_SIZE = 10;

const updateSetUpPlan = ({
  startDate,
  endDate,
  orderDetail,
}: {
  startDate: number;
  endDate: number;
  orderDetail: Record<string, any>;
}) => {
  const newOrderDetail = cloneDeep(orderDetail);

  Object.keys(orderDetail).forEach((date) => {
    if (Number(date) < startDate || Number(date) > endDate) {
      delete newOrderDetail[date];
    }
  });

  return newOrderDetail;
};

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
  orders: TListing[];
  queryOrderInProgress: boolean;
  queryOrderError: any;
  manageOrdersPagination: TPagination;
};

const CREATE_ORDER = 'app/Order/CREATE_ORDER';
const UPDATE_ORDER = 'app/Order/UPDATE_ORDER';
const FETCH_COMPANY_BOOKERS = 'app/Order/FETCH_COMPANY_BOOKERS';
const FETCH_ORDER = 'app/Order/FETCH_ORDER';
const FETCH_ORDER_DETAIL = 'app/Order/FETCH_ORDER_DETAIL';
const INITIATE_TRANSACTIONS = 'app/Order/INITIATE_TRANSACTIONS';
const QUERY_SUB_ORDERS = 'app/Order/QUERY_SUB_ORDERS';

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
  orders: [],
  queryOrderInProgress: false,
  queryOrderError: null,
  manageOrdersPagination: {
    totalItems: 0,
    totalPages: 0,
    page: 0,
    perPage: 0,
  },
};

const createOrder = createAsyncThunk(CREATE_ORDER, async (params: any) => {
  const { clientId, bookerId } = params;
  const apiBody = {
    companyId: clientId,
    bookerId,
  };
  const { data: orderListing } = await createOrderApi(apiBody);
  return orderListing;
});

const updateOrder = createAsyncThunk(
  UPDATE_ORDER,
  async (params: any, { getState }) => {
    const { order } = getState().Order;
    const orderId = LISTING(order as TListing).getId();
    const { data: orderListing } = await updateOrderApi({ ...params, orderId });
    return orderListing;
  },
);

const initiateTransactions = createAsyncThunk(
  INITIATE_TRANSACTIONS,
  async (params: any) => {
    await initiateTransactionsApi(params);
    return '';
  },
);

const queryOrders = createAsyncThunk(
  QUERY_SUB_ORDERS,
  async (payload: any = {}) => {
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
    const { members = {} } = USER(companyAccount).getMetadata();
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

    const { plans = [] } = LISTING(order as TListing).getMetadata();
    if (plans[0]) {
      const response = denormalisedResponseEntities(
        await sdk.listings.show({
          id: plans[0],
        }),
      )[0];
      return LISTING(response).getMetadata().orderDetail;
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

    const { bookerId } = LISTING(response).getMetadata();
    const selectedBooker = denormalisedResponseEntities(
      await sdk.users.show({
        id: bookerId,
      }),
    )[0];
    return { order: response, selectedBooker };
  },
);

export const OrderAsyncAction = {
  createOrder,
  updateOrder,
  fetchCompanyBookers,
  fetchOrderDetail,
  fetchOrder,
  initiateTransactions,
  queryOrders,
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
      const { orderDetail, ...restPayload } = payload;
      const { startDate, endDate } = restPayload;
      const { orderDetail: oldOrderDetail } = state;
      const updatedOrderDetailData = { ...oldOrderDetail, ...orderDetail };

      return {
        ...state,
        orderDetail: updateSetUpPlan({
          startDate,
          endDate,
          orderDetail: updatedOrderDetailData,
        }),
      };
    },
    removeMealDay: (state, { payload }) => ({
      ...state,
      draftOrder: {
        ...state.draftOrder,
        orderDetail: payload,
      },
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
