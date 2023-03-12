import { createSlice } from '@reduxjs/toolkit';

import { createAsyncThunk } from '@redux/redux.helper';
import type { TCurrentUser } from '@utils/types';

type TShoppingCartState = {
  orders: {
    [memberId: string]: {
      [planId: string]: {
        [dayId: number]: string;
      };
    };
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
        };
      },
    ) => {
      const { currentUserId, planId, dayId, mealId } = payload || {};

      return {
        ...state,
        orders: {
          ...state.orders,
          [currentUserId]: {
            ...(state.orders?.[currentUserId] || {}),
            [planId]: {
              ...(state.orders?.[currentUserId]?.[planId] || {}),
              [dayId]: mealId,
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
        };
      },
    ) => {
      const { currentUserId, planId, dayId } = payload || {};

      return {
        ...state,
        orders: {
          ...state.orders,
          [currentUserId]: {
            ...(state.orders?.[currentUserId] || {}),
            [planId]: {
              ...(state.orders?.[currentUserId]?.[planId] || {}),
              [dayId]: undefined,
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
    }: { planId: string; dayId: string; mealId: string },
    { getState, dispatch },
  ) => {
    const { currentUser } = getState().user;

    return dispatch(
      shoppingCartSlice.actions.addToCart({
        currentUserId: (currentUser as TCurrentUser).id.uuid,
        planId,
        dayId,
        mealId,
      }),
    );
  },
);

const removeFromCartThunk = createAsyncThunk(
  REMOVE_FROM_CART,
  async (
    { planId, dayId }: { planId: string; dayId: string },
    { getState, dispatch },
  ) => {
    const { currentUser } = getState().user;

    return dispatch(
      shoppingCartSlice.actions.removeToCart({
        currentUserId: (currentUser as TCurrentUser).id.uuid,
        planId,
        dayId,
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
