import { createSlice } from '@reduxjs/toolkit';
import difference from 'lodash/difference';

import { participantSubOrderAddDocumentApi } from '@apis/firebaseApi';
import { loadPlanDataApi, updateParticipantOrderApi } from '@apis/index';
import {
  OrderListActions,
  recommendFood,
} from '@pages/participant/orders/OrderList.slice';
import { createAsyncThunk } from '@redux/redux.helper';
import {
  shoppingCartActions,
  shoppingCartThunks,
} from '@redux/slices/shoppingCart.slice';
import { CurrentUser, Listing } from '@src/utils/data';
import type { TListing } from '@src/utils/types';
import { EParticipantOrderStatus } from '@utils/enums';
import { storableError } from '@utils/errors';

const LOAD_DATA = 'app/ParticipantPlanPage/LOAD_DATA';
const RELOAD_DATA = 'app/ParticipantPlanPage/RELOAD_DATA';
const UPDATE_ORDER = 'app/ParticipantPlanPage/UPDATE_ORDER';
const RECOMMEND_FOOD_SUB_ORDER =
  'app/ParticipantPlanPage/RECOMMEND_FOOD_SUB_ORDER';
const RECOMMEND_FOOD_SUB_ORDERS =
  'app/ParticipantPlanPage/RECOMMEND_FOOD_SUB_ORDERS';

const recommendFoodForShoppingCart = ({
  plan,
  subOrderDate,
  packagePerMember,
  allergies,
  plans,
  dispatch,
  currentMealId,
}: {
  plan: any;
  subOrderDate: string;
  packagePerMember: number;
  allergies: string[];
  plans: string[];
  dispatch: any;
  currentMealId?: string;
}) => {
  const subOrder = plan[subOrderDate];
  const { foodList } = subOrder;

  const suitablePriceFoodList = foodList.filter(
    (food: TListing) =>
      Listing(food).getAttributes().price.amount <= packagePerMember,
  );

  let mostSuitableFood: any = recommendFood({
    foodList: suitablePriceFoodList,
    subOrderFoodIds: suitablePriceFoodList.map((food: TListing) =>
      Listing(food).getId(),
    ),
    allergies,
  });

  const mostSuitableFoodListing = Listing(mostSuitableFood!);

  while (
    currentMealId &&
    suitablePriceFoodList.length > 1 &&
    mostSuitableFoodListing.getId() === currentMealId
  ) {
    mostSuitableFood = recommendFood({
      foodList: suitablePriceFoodList,
      subOrderFoodIds: suitablePriceFoodList.map((food: TListing) =>
        Listing(food).getId(),
      ),
      allergies,
    });
  }

  dispatch(
    shoppingCartThunks.addToCart({
      planId: plans[0],
      dayId: subOrderDate,
      mealId: mostSuitableFoodListing.getId(),
    }),
  );

  return {
    foodName: mostSuitableFoodListing.getAttributes().title,
  };
};

type TParticipantPlanState = {
  restaurant: any;
  company: any;
  plan: any;
  order: any;
  loadDataInProgress: boolean;
  loadDataError: any;
  reloadDataInProgress: boolean;
  reloadDataError: any;
  submitDataInprogress: boolean;
  submitDataError: any;
};

const initialState: TParticipantPlanState = {
  restaurant: {},
  company: {},
  plan: {},
  order: {},
  loadDataInProgress: false,
  loadDataError: null,
  reloadDataInProgress: false,
  reloadDataError: null,
  submitDataInprogress: false,
  submitDataError: null,
};

const loadData = createAsyncThunk(
  LOAD_DATA,
  async (planId: string, { getState, dispatch }) => {
    const { currentUser } = getState().user;
    const currentUserId = currentUser?.id?.uuid;
    const response: any = await loadPlanDataApi(planId);
    const plan = response?.data?.data?.plan;
    const orderDays = Object.keys(plan);

    orderDays.forEach((day) => {
      const {
        status,
        foodId,
        requirement = '',
      } = plan?.[day]?.memberOrder?.[currentUserId] || {};

      if (status !== EParticipantOrderStatus.empty) {
        dispatch(
          shoppingCartActions.addToCart({
            currentUserId,
            planId,
            dayId: day,
            mealId:
              status === EParticipantOrderStatus.notJoined ? status : foodId,
            requirement,
          }),
        );
      }
    });

    return response?.data?.data;
  },
  {
    serializeError: storableError,
  },
);

const reloadData = createAsyncThunk(
  RELOAD_DATA,
  async (planId: string, { getState, dispatch }) => {
    const { currentUser } = getState().user;
    const currentUserId = currentUser?.id?.uuid;
    const response: any = await loadPlanDataApi(planId);
    const plan = response?.data?.data?.plan;
    const orderDays = Object.keys(plan);

    dispatch(shoppingCartThunks.removeAllFromPlanCart({ planId }));

    orderDays.forEach((day) => {
      const { status, requirement, foodId } =
        plan?.[day]?.memberOrder?.[currentUserId] || {};

      if (status !== EParticipantOrderStatus.empty) {
        dispatch(
          shoppingCartActions.addToCart({
            currentUserId,
            planId,
            dayId: day,
            mealId:
              status === EParticipantOrderStatus.notJoined ? status : foodId,
            requirement,
          }),
        );
      }
    });

    return response?.data?.data;
  },
  {
    serializeError: storableError,
  },
);

const updateOrder = createAsyncThunk(
  UPDATE_ORDER,
  async (
    data: { orderId: string; planId: string },
    { getState, dispatch },
  ): Promise<boolean> => {
    const { orderId, planId } = data;
    const { currentUser } = getState().user;
    const currentUserId = currentUser?.id?.uuid;
    const { orders } = getState().shoppingCart;
    const planData = orders?.[currentUserId]?.[planId] || {};
    const orderDays = Object.keys(planData);

    const updatedPlan = orderDays.reduce((acc: any, curr: any) => {
      const { foodId = '', requirement = '' } = planData[curr] || {};

      return {
        ...acc,
        [curr]: {
          [currentUserId]:
            // eslint-disable-next-line no-nested-ternary
            foodId === EParticipantOrderStatus.notJoined
              ? {
                  status: EParticipantOrderStatus.notJoined,
                  foodId: '',
                  requirement,
                }
              : {
                  status:
                    foodId?.length > 0
                      ? EParticipantOrderStatus.joined
                      : EParticipantOrderStatus.empty,
                  foodId,
                  requirement,
                },
        },
      };
    }, {});

    const updateValues = {
      orderId,
      orderDays,
      planId,
      planData: updatedPlan,
    };

    const {
      data: { plan: newPlan, jobId },
    } = await updateParticipantOrderApi(orderId, updateValues);
    dispatch(OrderListActions.updatePlanDetail(newPlan));
    orderDays.forEach((timestamp: string) => {
      participantSubOrderAddDocumentApi({
        participantId: currentUserId,
        planId,
        timestamp: parseInt(`${timestamp}`, 10),
      });
    });
    await dispatch(reloadData(planId));
    orderDays.map(async (subOrderDate: string) => {
      await participantSubOrderAddDocumentApi({
        participantId: currentUserId,
        planId,
        timestamp: parseInt(`${subOrderDate}`, 10),
      });
    });

    return !!jobId;
  },
  {
    serializeError: storableError,
  },
);

export const recommendFoodSubOrder = createAsyncThunk(
  RECOMMEND_FOOD_SUB_ORDER,
  async (subOrderDate: string, { getState, dispatch }) => {
    const { currentUser } = getState().user;
    const { plan, order } = getState().ParticipantPlanPage;
    const { orders } = getState().shoppingCart;
    const currentUserGetter = CurrentUser(currentUser!);
    const { allergies = [] } = currentUserGetter.getPublicData();
    const orderListing = Listing(order!);
    const { packagePerMember = 0, plans = [] } = orderListing.getMetadata();
    const currentMealId =
      orders[currentUserGetter.getId()]?.[plans[0]]?.[+subOrderDate]?.foodId;

    return recommendFoodForShoppingCart({
      plan,
      subOrderDate,
      packagePerMember,
      allergies,
      plans,
      dispatch,
      currentMealId,
    });
  },
  {
    serializeError: storableError,
  },
);

const recommendFoodSubOrders = createAsyncThunk(
  RECOMMEND_FOOD_SUB_ORDERS,
  async (_, { getState, dispatch }) => {
    const { currentUser } = getState().user;
    const { plan, order } = getState().ParticipantPlanPage;
    const { orders } = getState().shoppingCart;
    const currentUserGetter = CurrentUser(currentUser!);
    const currentUserId = currentUserGetter.getId();
    const { allergies = [] } = currentUserGetter.getPublicData();
    const orderListing = Listing(order!);
    const { packagePerMember = 0, plans = [] } = orderListing.getMetadata();
    const subOrderDates = Object.keys(plan);
    const notJoinedDay = Object.keys(plan).reduce(
      (acc: any, subOrderDate: string) => {
        const { memberOrder } = plan[subOrderDate];
        const { status } = memberOrder[currentUserId] || {};
        if (status === EParticipantOrderStatus.notJoined) {
          return [...acc, subOrderDate];
        }

        return acc;
      },
      [],
    );
    const notJoinedDayFromOrderShoppingCart = Object.keys(
      orders[currentUserId]?.[plans[0]] || {},
    ).reduce((acc: any, subOrderDate: string) => {
      const { foodId } =
        orders[currentUserId]?.[plans[0]]?.[+subOrderDate] || {};
      if (foodId === EParticipantOrderStatus.notJoined) {
        return [...acc, subOrderDate];
      }

      return acc;
    }, []);
    const mergedNotJoinedDay = [
      ...notJoinedDay,
      ...notJoinedDayFromOrderShoppingCart,
    ];

    const recommendSubOrderDays = difference(subOrderDates, mergedNotJoinedDay);

    recommendSubOrderDays.forEach((subOrderDate: string) => {
      const currentMealId =
        orders[currentUserGetter.getId()]?.[plans[0]]?.[+subOrderDate]?.foodId;
      recommendFoodForShoppingCart({
        plan,
        subOrderDate,
        packagePerMember,
        allergies,
        plans,
        dispatch,
        currentMealId,
      });
    });
  },
  {
    serializeError: storableError,
  },
);

export const ParticipantPlanThunks = {
  loadData,
  reloadData,
  updateOrder,
  recommendFoodSubOrder,
  recommendFoodSubOrders,
};

const participantPlanSlice = createSlice({
  name: 'ParticipantPlanPage',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadData.pending, (state) => {
        return {
          ...state,
          loadDataInProgress: true,
          loadDataError: null,
        };
      })
      .addCase(loadData.fulfilled, (state, { payload }) => {
        return {
          ...state,
          ...payload,
          loadDataInProgress: false,
        };
      })
      .addCase(loadData.rejected, (state, { error }) => ({
        ...state,
        loadDataError: error.message,
        loadDataInProgress: false,
      }))
      .addCase(reloadData.pending, (state) => {
        return {
          ...state,
          reloadDataInProgress: true,
          reloadDataError: null,
        };
      })
      .addCase(reloadData.fulfilled, (state, { payload }) => {
        return {
          ...state,
          ...payload,
          reloadDataInProgress: false,
        };
      })
      .addCase(reloadData.rejected, (state, { error }) => ({
        ...state,
        reloadDataError: error.message,
        reloadDataInProgress: false,
      }))
      .addCase(updateOrder.pending, (state) => {
        state.submitDataInprogress = true;
        state.submitDataError = null;
      })
      .addCase(updateOrder.fulfilled, (state) => {
        state.submitDataInprogress = false;
      })
      .addCase(updateOrder.rejected, (state, { error }) => {
        state.submitDataInprogress = false;
        state.submitDataError = error.message;
      });
  },
});

export default participantPlanSlice.reducer;
