import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';

type ShopingCartState = {
  orders: {
    [memberId: string]: {
      [planId: string]: {
        [dayId: number]: string;
      };
    };
  };
};

// ================ Thunk types ================ //
const ADD_TO_CART = 'app/ShopingCart/ADD_TO_CART';
const REMOVE_FROM_CART = 'app/ShopingCart/REMOVE_FROM_CART';
const REMOVE_ALL_FROM_PLAN_CART = 'app/ShopingCart/REMOVE_ALL_FROM_PLAN_CART';

const initialState: ShopingCartState = {
  orders: {},
};

// ================ Slice ================ //
export const shopingCartSlice = createSlice({
  name: 'shopingCart',
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
      return {
        ...state,
        orders: {
          ...state.orders,
          [currentUserId]: {
            ...(state.orders?.[currentUserId] || {}),
            [planId]: {},
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
      shopingCartSlice.actions.addToCart({
        currentUserId: currentUser.id.uuid,
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
      shopingCartSlice.actions.removeToCart({
        currentUserId: currentUser.id.uuid,
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
      shopingCartSlice.actions.removeAllFromPlanCart({
        currentUserId: currentUser.id.uuid,
        planId,
      }),
    );
  },
);

export const shopingCartThunks = {
  addToCart: addToCartThunk,
  removeFromCart: removeFromCartThunk,
  removeAllFromPlanCart: removeAllFromPlanCartThunk,
};

export const shopingCartActions = shopingCartSlice.actions;

export default shopingCartSlice.reducer;
