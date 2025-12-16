import { createSlice } from '@reduxjs/toolkit';

import { createAsyncThunk } from '@redux/redux.helper';
import type { TCartItem } from '@src/types/order';
import type { TCurrentUser } from '@utils/types';

export type TMemberPlan = {
  [dayId: string]: TCartItem;
};

export type TMemberPlans = {
  [planId: string]: TMemberPlan;
};

export type TShoppingCartState = {
  orders: {
    [memberId: string]: TMemberPlans;
  };
};

// ================ Thunk types ================ //
const ADD_TO_CART = 'app/ShoppingCart/ADD_TO_CART';
const REMOVE_FROM_CART = 'app/ShoppingCart/REMOVE_FROM_CART';
const REMOVE_ALL_FROM_PLAN_CART = 'app/ShoppingCart/REMOVE_ALL_FROM_PLAN_CART';

const initialState: TShoppingCartState = {
  orders: {},
};

// ================ Slice ================ //
export const shoppingCartSlice = createSlice({
  name: 'ShoppingCart',
  initialState,
  reducers: {
    addToCart: (
      state,
      {
        payload,
      }: {
        payload: {
          currentUserId: string;
          planId: string;
          dayId: string;
          mealId: string;
          requirement?: string;
          isSecondFood?: boolean;
        };
      },
    ) => {
      const {
        currentUserId,
        planId,
        dayId,
        mealId: foodId,
        requirement = '',
        isSecondFood = false,
      } = payload || {};

      const currentCartItem = state.orders?.[currentUserId]?.[planId]?.[
        dayId
      ] || {
        foodId: '',
        requirement: '',
      };

      if (foodId === 'notJoined') {
        return {
          ...state,
          orders: {
            ...state.orders,
            [currentUserId]: {
              ...(state.orders?.[currentUserId] || {}),
              [planId]: {
                ...(state.orders?.[currentUserId]?.[planId] || {}),
                [dayId]: {
                  foodId,
                  requirement: '',
                },
              },
            },
          },
        };
      }

      // Nếu là món thứ 2, thêm vào secondaryFoodId
      if (isSecondFood) {
        return {
          ...state,
          orders: {
            ...state.orders,
            [currentUserId]: {
              ...(state.orders?.[currentUserId] || {}),
              [planId]: {
                ...(state.orders?.[currentUserId]?.[planId] || {}),
                [dayId]: {
                  ...currentCartItem,
                  secondaryFoodId: foodId,
                  secondaryRequirement: requirement,
                },
              },
            },
          },
        };
      }

      // Nếu là món đầu tiên, thay thế hoàn toàn
      return {
        ...state,
        orders: {
          ...state.orders,
          [currentUserId]: {
            ...(state.orders?.[currentUserId] || {}),
            [planId]: {
              ...(state.orders?.[currentUserId]?.[planId] || {}),
              [dayId]: {
                foodId,
                requirement,
                // Giữ lại món thứ 2 nếu có
                ...(currentCartItem.secondaryFoodId && {
                  secondaryFoodId: currentCartItem.secondaryFoodId,
                  secondaryRequirement: currentCartItem.secondaryRequirement,
                }),
              },
            },
          },
        },
      };
    },
    removeToCart: (
      state,
      {
        payload,
      }: {
        payload: {
          currentUserId: string;
          planId: string;
          dayId: string;
          removeSecondFood?: boolean; // Flag để xóa món thứ 2 thay vì món đầu
        };
      },
    ) => {
      const {
        currentUserId,
        planId,
        dayId,
        removeSecondFood = false,
      } = payload || {};
      const currentCartItem =
        state.orders?.[currentUserId]?.[planId]?.[dayId] || {};

      // Nếu xóa món thứ 2, chỉ xóa secondaryFoodId
      if (removeSecondFood) {
        return {
          ...state,
          orders: {
            ...state.orders,
            [currentUserId]: {
              ...(state.orders?.[currentUserId] || {}),
              [planId]: {
                ...(state.orders?.[currentUserId]?.[planId] || {}),
                [dayId]: {
                  ...currentCartItem,
                  secondaryFoodId: undefined,
                  secondaryRequirement: undefined,
                },
              },
            },
          },
        };
      }

      // UX: Nếu xóa món đầu tiên và có món thứ 2, đẩy món thứ 2 lên làm món 1
      if (currentCartItem.secondaryFoodId) {
        return {
          ...state,
          orders: {
            ...state.orders,
            [currentUserId]: {
              ...(state.orders?.[currentUserId] || {}),
              [planId]: {
                ...(state.orders?.[currentUserId]?.[planId] || {}),
                [dayId]: {
                  foodId: currentCartItem.secondaryFoodId,
                  requirement: currentCartItem.secondaryRequirement || '',
                  // Xóa món thứ 2 sau khi đẩy lên
                  secondaryFoodId: undefined,
                  secondaryRequirement: undefined,
                },
              },
            },
          },
        };
      }

      // Xóa toàn bộ nếu không có món thứ 2
      return {
        ...state,
        orders: {
          ...state.orders,
          [currentUserId]: {
            ...(state.orders?.[currentUserId] || {}),
            [planId]: {
              ...(state.orders?.[currentUserId]?.[planId] || {}),
              [dayId]: {
                foodId: '',
                requirement: '',
              },
            },
          },
        },
      };
    },
    removeAllFromPlanCart: (
      state,
      {
        payload,
      }: {
        payload: {
          currentUserId: string;
          planId: string;
        };
      },
    ) => {
      const { currentUserId, planId } = payload || {};
      const orderDays = Object.keys(
        state.orders?.[currentUserId]?.[planId] || {},
      );
      const mappingData = orderDays.reduce((acc: any, currDay: any) => {
        // eslint-disable-next-line no-param-reassign
        acc[currDay] = null;

        return acc;
      }, {});

      return {
        ...state,
        orders: {
          ...state.orders,
          [currentUserId]: {
            ...(state.orders?.[currentUserId] || {}),
            [planId]: mappingData,
          },
        },
      };
    },
  },
});

// ================ Thunk functions ================ //
const addToCartThunk = createAsyncThunk(
  ADD_TO_CART,
  async (
    {
      planId,
      dayId,
      mealId,
      requirement,
      isSecondFood,
    }: {
      planId: string;
      dayId: string;
      mealId: string;
      requirement?: string;
      isSecondFood?: boolean;
    },
    { getState, dispatch },
  ) => {
    const { currentUser } = getState().user;

    return dispatch(
      shoppingCartSlice.actions.addToCart({
        currentUserId: (currentUser as TCurrentUser).id.uuid,
        planId,
        dayId,
        mealId,
        requirement,
        isSecondFood,
      }),
    );
  },
);

const removeFromCartThunk = createAsyncThunk(
  REMOVE_FROM_CART,
  async (
    {
      planId,
      dayId,
      removeSecondFood,
    }: {
      planId: string;
      dayId: string;
      removeSecondFood?: boolean;
    },
    { getState, dispatch },
  ) => {
    const { currentUser } = getState().user;

    return dispatch(
      shoppingCartSlice.actions.removeToCart({
        currentUserId: (currentUser as TCurrentUser).id.uuid,
        planId,
        dayId,
        removeSecondFood,
      }),
    );
  },
);

const removeAllFromPlanCartThunk = createAsyncThunk(
  REMOVE_ALL_FROM_PLAN_CART,
  async ({ planId }: { planId: string }, { getState, dispatch }) => {
    const { currentUser } = getState().user;

    return dispatch(
      shoppingCartSlice.actions.removeAllFromPlanCart({
        currentUserId: (currentUser as TCurrentUser).id.uuid,
        planId,
      }),
    );
  },
);

export const shoppingCartThunks = {
  addToCart: addToCartThunk,
  removeFromCart: removeFromCartThunk,
  removeAllFromPlanCart: removeAllFromPlanCartThunk,
};

export const shoppingCartActions = shoppingCartSlice.actions;

export default shoppingCartSlice.reducer;
