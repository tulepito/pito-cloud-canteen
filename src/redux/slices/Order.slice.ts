import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import {
  addMealPlanDetailApi,
  completeOrderApi,
  createOrderApi,
  updateMealPlanDetailApi,
} from '@utils/orderApi';
import type { TListing } from '@utils/types';
import cloneDeep from 'lodash/cloneDeep';

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

type OrderInitialState = {
  order: TListing | null;
  plans: TListing[];
  createOrderInProcess: boolean;
  createOrderError: any;

  addMealPlanDetailInProgress: boolean;
  addMealPlanDetailError: any;

  completeOrderInProgress: boolean;
  completeOrderError: any;
  draftOrder: any;
  selectedCompany: any;
};

const CREATE_ORDER = 'app/Order/CREATE_ORDER';
const ADD_MEAL_PLAN_DETAIL = 'app/Order/ADD_MEAL_PLAN_DETAIL';
const UPDATE_MEAL_PLAN_DETAIL = 'app/Order/UPDATE_MEAL_PLAN_DETAIL';
const COMPLETE_ORDER = 'app/Order/COMPLETE_ORDER';

const initialState: OrderInitialState = {
  order: null,
  plans: [],
  createOrderInProcess: false,
  createOrderError: null,

  addMealPlanDetailInProgress: false,
  addMealPlanDetailError: null,

  completeOrderInProgress: false,
  completeOrderError: null,
  draftOrder: {},
  selectedCompany: null,
};

const createOrder = createAsyncThunk(
  CREATE_ORDER,
  async (staffName: string, { getState }) => {
    const { draftOrder } = getState().Order;
    const { clientId, orderDetail, ...rest } = draftOrder;
    const apiBody = {
      companyId: clientId,
      generalInfo: {
        ...rest,
        staffName,
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

const completeOrder = createAsyncThunk(
  COMPLETE_ORDER,
  async (planId: string, { getState }) => {
    const { order } = getState().Order;
    await completeOrderApi({
      orderId: order?.id.uuid,
      planId,
    });
    return '';
  },
);

export const OrderAsyncAction = {
  createOrder,
  addMealPlanDetail,
  updateMealPlanDetail,
  completeOrder,
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

      .addCase(completeOrder.pending, (state) => ({
        ...state,
        completeOrderInProgress: true,
      }))
      .addCase(completeOrder.fulfilled, (state) => ({
        ...state,
        completeOrderInProgress: false,
      }))
      .addCase(completeOrder.rejected, (state, { error }) => ({
        ...state,
        completeOrderInProgress: false,
        completeOrderError: error.message,
      }));
  },
});

export const { addCompanyClient, updateDraftMealPlan, removeDraftOrder } =
  orderSlice.actions;

export default orderSlice.reducer;
