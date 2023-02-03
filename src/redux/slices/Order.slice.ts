import { companyApi } from '@apis/companyApi';
import {
  addMealPlanDetailApi,
  createOrderApi,
  initiateTransactionsApi,
  queryOrdersApi,
  updateMealPlanDetailApi,
} from '@apis/orderApi';
import { LISTING_TYPE } from '@pages/api/helpers/constants';
import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import { EOrderStates } from '@utils/enums';
import { storableError } from '@utils/errors';
import type { TListing, TObject, TPagination } from '@utils/types';
import cloneDeep from 'lodash/cloneDeep';
import { DateTime } from 'luxon';

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
  plans: TListing[];
  createOrderInProcess: boolean;
  createOrderError: any;

  addMealPlanDetailInProgress: boolean;
  addMealPlanDetailError: any;

  initiateTransactionsInProgress: boolean;
  initiateTransactionsError: any;
  draftOrder: any;
  selectedCompany: any;

  // Manage Orders Page
  orders: TListing[];
  queryOrderInProgress: boolean;
  queryOrderError: any;
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
const ADD_MEAL_PLAN_DETAIL = 'app/Order/ADD_MEAL_PLAN_DETAIL';
const UPDATE_MEAL_PLAN_DETAIL = 'app/Order/UPDATE_MEAL_PLAN_DETAIL';
const INITIATE_TRANSACTIONS = 'app/Order/INITIATE_TRANSACTIONS';
const QUERY_SUB_ORDERS = 'app/Order/QUERY_SUB_ORDERS';

const initialState: TOrderInitialState = {
  order: null,
  plans: [],
  createOrderInProcess: false,
  createOrderError: null,

  addMealPlanDetailInProgress: false,
  addMealPlanDetailError: null,

  initiateTransactionsInProgress: false,
  initiateTransactionsError: null,
  draftOrder: {},
  selectedCompany: null,

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
  totalItemMap: {
    [EOrderStates.picking]: 0,
    [EOrderStates.completed]: 0,
    [EOrderStates.isNew]: 0,
    [EOrderStates.canceled]: 0,
    all: 0,
  },
};

const createOrder = createAsyncThunk(
  CREATE_ORDER,
  async (staffName: string, { getState }) => {
    const { draftOrder } = getState().Order;
    const { clientId, orderDetail, ...rest } = draftOrder;
    const { deadlineDate, deadlineHour } = rest;
    const parsedDeadlineDate =
      DateTime.fromMillis(deadlineDate).toFormat('yyyy-MM-dd');
    const orderDeadline = DateTime.fromISO(
      `${parsedDeadlineDate}T${deadlineHour}:00`,
    ).toMillis();
    const apiBody = {
      companyId: clientId,
      generalInfo: {
        ...rest,
        staffName,
        orderDeadline,
      },
      orderDetail,
    };
    const { data: orderListing } = await createOrderApi(apiBody);
    await addMealPlanDetailApi({
      orderId: orderListing.data.id.uuid,
    });
    return orderListing;
  },
);

const addMealPlanDetail = createAsyncThunk(
  ADD_MEAL_PLAN_DETAIL,
  async (params: any) => {
    const {
      data: { orderListing, planListing },
    } = await addMealPlanDetailApi({ ...params });
    // return order listing entity
    return {
      orderListing,
      planListing,
    };
  },
);

const updateMealPlanDetail = createAsyncThunk(
  UPDATE_MEAL_PLAN_DETAIL,
  async (params: any, { getState }) => {
    const { plans } = getState().Order;
    const {
      data: { planListing },
    } = await updateMealPlanDetailApi(params);
    const newPlans = plans.map((plan) =>
      plan.id.uuid === planListing.id.uuid ? planListing : plan,
    );
    return newPlans;
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

    return { orders, pagination, totalItemMap };
  },
  {
    serializeError: storableError,
  },
);

export const orderAsyncActions = {
  createOrder,
  addMealPlanDetail,
  updateMealPlanDetail,
  initiateTransactions,
  queryOrders,
  queryCompanyOrders,
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
    updateDraftMealPlan: (state, { payload }) => {
      const { orderDetail, ...restPayload } = payload;
      const { startDate, endDate } = restPayload;
      const { orderDetail: oldOrderDetail } = state.draftOrder;
      const updatedOrderDetailData = { ...oldOrderDetail, ...orderDetail };

      return {
        ...state,
        draftOrder: {
          ...state.draftOrder,
          ...restPayload,
          orderDetail: updateSetUpPlan({
            startDate,
            endDate,
            orderDetail: updatedOrderDetailData,
          }),
        },
      };
    },
    removeDraftOrder: (state) => ({
      ...state,
      draftOrder: {},
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

      .addCase(addMealPlanDetail.pending, (state) => ({
        ...state,
        addMealPlanDetailInProgress: true,
      }))
      .addCase(addMealPlanDetail.fulfilled, (state, { payload }) => ({
        ...state,
        addMealPlanDetailInProgress: false,
        order: payload.orderListing,
        plans: [...state.plans, payload.planListing],
      }))
      .addCase(addMealPlanDetail.rejected, (state, { error }) => ({
        ...state,
        addMealPlanDetailInProgress: false,
        addMealPlanDetailError: error.message,
      }))

      .addCase(updateMealPlanDetail.pending, (state) => ({
        ...state,
        addMealPlanDetailInProgress: true,
      }))
      .addCase(updateMealPlanDetail.fulfilled, (state, { payload }) => ({
        ...state,
        addMealPlanDetailInProgress: false,
        plans: payload,
      }))
      .addCase(updateMealPlanDetail.rejected, (state, { error }) => ({
        ...state,
        addMealPlanDetailInProgress: false,
        addMealPlanDetailError: error.message,
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
      /* =============== queryCompanyOrders =============== */
      .addCase(queryCompanyOrders.pending, (state) => {
        state.queryOrderInProgress = true;
        state.queryOrderError = null;
      })
      .addCase(
        queryCompanyOrders.fulfilled,
        (state, { payload: { orders, pagination, totalItemMap } }) => ({
          ...state,
          queryOrderInProgress: false,
          orders,
          manageOrdersPagination: pagination,
          totalItemMap,
        }),
      )
      .addCase(queryCompanyOrders.rejected, (state, { payload }) => {
        state.queryOrderInProgress = false;
        state.queryOrderError = payload;
      });
  },
});

export const { addCompanyClient, updateDraftMealPlan, removeDraftOrder } =
  orderSlice.actions;

export default orderSlice.reducer;
