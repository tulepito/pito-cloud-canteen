import { createSlice } from '@reduxjs/toolkit';
import difference from 'lodash/difference';

import { participantSubOrderAddDocumentApi } from '@apis/firebaseApi';
import { loadPlanDataApi, updateParticipantOrderApi } from '@apis/index';
import { recommendFood } from '@pages/participant/orders/OrderList.slice';
import { createAsyncThunk } from '@redux/redux.helper';
import {
  shoppingCartActions,
  shoppingCartThunks,
} from '@redux/slices/shoppingCart.slice';
import type {
  TCartItem,
  TPlanData,
  TShoppingCartMemberPlan,
  TUpdateParticipantOrderBody,
} from '@src/types/order';
import { PICKING_ONLY_ONE_FOOD_NAMES } from '@src/utils/constants';
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
  currentSecondaryMealId,
  isAllowAddSecondFood,
}: {
  plan: any;
  subOrderDate: string;
  packagePerMember: number;
  allergies: string[];
  plans: string[];
  dispatch: any;
  currentMealId?: string;
  currentSecondaryMealId?: string;
  isAllowAddSecondFood?: boolean;
}) => {
  const subOrder = plan[subOrderDate];
  const { foodList } = subOrder;

  const getFoodIdList = (foods: TListing[]) =>
    foods.map((food: TListing) => Listing(food).getId());

  const suitablePriceFoodList = foodList.filter((food: TListing) => {
    return Listing(food).getAttributes().price.amount <= packagePerMember;
  });

  const pickRandomFood = (foods: TListing[]) => {
    if (!foods.length) {
      return undefined;
    }

    return recommendFood({
      foodList: foods,
      subOrderFoodIds: getFoodIdList(foods),
      allergies,
    });
  };

  const pickRandomFoodExcludingIds = (
    foods: TListing[],
    excludeIds: string[] = [],
  ) => {
    const filteredFoods = foods.filter((food: TListing) => {
      const foodId = Listing(food).getId();

      return !excludeIds.includes(foodId);
    });

    return pickRandomFood(filteredFoods);
  };

  let mostSuitableFood = pickRandomFood(suitablePriceFoodList);

  if (currentMealId) {
    const alternativeExcludeIds = [currentMealId];
    const alternativeFood = pickRandomFoodExcludingIds(
      suitablePriceFoodList,
      alternativeExcludeIds,
    );

    if (alternativeFood) {
      mostSuitableFood = alternativeFood;
    }
  }

  if (!mostSuitableFood) {
    return { foodName: '' };
  }

  const mostSuitableFoodListing = Listing(mostSuitableFood as TListing);

  dispatch(
    shoppingCartThunks.addToCart({
      planId: plans[0],
      dayId: subOrderDate,
      mealId: mostSuitableFoodListing.getId(),
    }),
  );

  const primaryFoodTitle = mostSuitableFoodListing.getAttributes().title || '';
  const isPrimarySingleSelectionFood = PICKING_ONLY_ONE_FOOD_NAMES.some(
    (name) => primaryFoodTitle?.includes(name),
  );

  if (
    isAllowAddSecondFood &&
    !isPrimarySingleSelectionFood &&
    suitablePriceFoodList.length > 1
  ) {
    const secondaryCandidates = suitablePriceFoodList.filter(
      (food: TListing) => {
        const listing = Listing(food);
        const title = listing.getAttributes().title || '';
        const isSingleSelectionFood = PICKING_ONLY_ONE_FOOD_NAMES.some((name) =>
          title?.includes(name),
        );

        return (
          listing.getId() !== mostSuitableFoodListing.getId() &&
          !isSingleSelectionFood
        );
      },
    );

    const excludedSecondaryIds = [
      mostSuitableFoodListing.getId(),
      currentSecondaryMealId,
    ].filter(Boolean) as string[];

    const secondaryFood = pickRandomFoodExcludingIds(
      secondaryCandidates,
      excludedSecondaryIds,
    );

    if (secondaryFood) {
      const secondaryFoodListing = Listing(secondaryFood as TListing);

      dispatch(
        shoppingCartThunks.addToCart({
          planId: plans[0],
          dayId: subOrderDate,
          mealId: secondaryFoodListing.getId(),
          isSecondFood: true,
        }),
      );
    }
  }

  return {
    foodName: primaryFoodTitle,
  };
};

type TParticipantPlanState = {
  restaurant: any;
  company: any;
  plan: TPlanData;
  order: any;
  loadDataInProgress: boolean;
  loadDataError: any;
  reloadDataInProgress: boolean;
  reloadDataError: any;
  submitDataInprogress: boolean;
  submitDataError: any;
  isAllowAddSecondFood: boolean;
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
  isAllowAddSecondFood: false,
};

const loadData = createAsyncThunk(
  LOAD_DATA,
  async (planId: string, { getState, dispatch }) => {
    const { currentUser } = getState().user;
    const currentUserId = currentUser?.id?.uuid;
    const response = await loadPlanDataApi(planId);
    const { plan, order } = response?.data?.data || {};
    const orderDays = Object.keys(plan);
    const isAllowAddSecondFood =
      process.env.NEXT_PUBLIC_COMPANIES_ALLOWING_SECOND_FOOD?.includes(
        Listing(order as TListing).getMetadata().companyId ?? '',
      ) ?? false;

    orderDays.forEach((day) => {
      const {
        status,
        foodId,
        requirement = '',
        secondaryFoodId,
        secondaryRequirement,
      } = plan[day].memberOrder[currentUserId];

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
        if (secondaryFoodId) {
          dispatch(
            shoppingCartActions.addToCart({
              currentUserId,
              planId,
              dayId: day,
              mealId:
                status === EParticipantOrderStatus.notJoined
                  ? status
                  : secondaryFoodId,
              requirement: secondaryRequirement,
              isSecondFood: true,
            }),
          );
        }
      }
    });

    return {
      ...response?.data?.data,
      isAllowAddSecondFood,
    };
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
      const {
        status,
        requirement,
        foodId,
        secondaryFoodId,
        secondaryRequirement,
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
        if (secondaryFoodId) {
          dispatch(
            shoppingCartActions.addToCart({
              currentUserId,
              planId,
              dayId: day,
              mealId: secondaryFoodId,
              isSecondFood: true,
              requirement: secondaryRequirement,
            }),
          );
        }
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

    const buildCartItem = (
      foodId: string,
      requirement: string,
      secondaryFoodId?: string,
      secondaryRequirement?: string,
    ) => {
      const isNotJoined = foodId === EParticipantOrderStatus.notJoined;
      const status = isNotJoined
        ? EParticipantOrderStatus.notJoined
        : foodId?.length > 0
        ? EParticipantOrderStatus.joined
        : EParticipantOrderStatus.empty;

      const baseItem: TCartItem = {
        status,
        foodId: isNotJoined ? '' : foodId,
        requirement,
        ...(secondaryFoodId && {
          secondaryFoodId,
          secondaryRequirement,
        }),
      };

      return baseItem;
    };

    const updatedPlan = orderDays.reduce<TShoppingCartMemberPlan>(
      (acc, curr) => {
        const {
          foodId = '',
          requirement = '',
          secondaryFoodId,
          secondaryRequirement,
        } = planData[+curr] || {};

        return {
          ...acc,
          [curr]: {
            [currentUserId]: buildCartItem(
              foodId,
              requirement,
              secondaryFoodId,
              secondaryRequirement,
            ),
          },
        };
      },
      {},
    );

    const updateValues: TUpdateParticipantOrderBody = {
      orderId,
      orderDays,
      planId,
      planData: updatedPlan,
    };

    const {
      data: { jobId },
    } = await updateParticipantOrderApi(orderId, updateValues);
    await dispatch(reloadData(planId));
    // firebase documents for history sub-orders and rating feature
    await Promise.all(
      orderDays.map((timestamp: string) =>
        participantSubOrderAddDocumentApi({
          participantId: currentUserId,
          planId,
          timestamp: parseInt(timestamp, 10),
        }),
      ),
    );

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
    const { plan, order, isAllowAddSecondFood } =
      getState().ParticipantPlanPage;
    const { orders } = getState().shoppingCart;
    const currentUserGetter = CurrentUser(currentUser!);
    const { allergies = [] } = currentUserGetter.getPublicData();
    const orderListing = Listing(order as TListing);
    const { packagePerMember = 0, plans = [] } = orderListing.getMetadata();
    const currentMealId =
      orders[currentUserGetter.getId()]?.[plans[0]]?.[+subOrderDate]?.foodId;
    const currentSecondaryMealId =
      orders[currentUserGetter.getId()]?.[plans[0]]?.[+subOrderDate]
        ?.secondaryFoodId;

    return recommendFoodForShoppingCart({
      plan,
      subOrderDate,
      packagePerMember,
      allergies,
      plans,
      dispatch,
      currentMealId,
      currentSecondaryMealId,
      isAllowAddSecondFood,
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
    const { plan, order, isAllowAddSecondFood } =
      getState().ParticipantPlanPage;
    const { orders } = getState().shoppingCart;
    const currentUserGetter = CurrentUser(currentUser!);
    const currentUserId = currentUserGetter.getId();
    const { allergies = [] } = currentUserGetter.getPublicData();
    const orderListing = Listing(order as TListing);
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
      const currentSecondaryMealId =
        orders[currentUserGetter.getId()]?.[plans[0]]?.[+subOrderDate]
          ?.secondaryFoodId;
      recommendFoodForShoppingCart({
        plan,
        subOrderDate,
        packagePerMember,
        allergies,
        plans,
        dispatch,
        currentMealId,
        currentSecondaryMealId,
        isAllowAddSecondFood,
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
