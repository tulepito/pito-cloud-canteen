import { createSlice } from '@reduxjs/toolkit';

import { loadPlanDataApi, updateParticipantOrderApi } from '@apis/index';
import { createAsyncThunk } from '@redux/redux.helper';
import {
  shoppingCartActions,
  shoppingCartThunks,
} from '@redux/slices/shoppingCart.slice';
import { EParticipantOrderStatus } from '@utils/enums';
import { storableError } from '@utils/errors';

const LOAD_DATA = 'app/ParticipantPlanPage/LOAD_DATA';
const RELOAD_DATA = 'app/ParticipantPlanPage/RELOAD_DATA';
const UPDATE_ORDER = 'app/ParticipantPlanPage/UPDATE_ORDER';

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
      const userOder = plan?.[day]?.memberOrder?.[currentUserId];
      const status = userOder?.status;
      if (status === 'joined' || status === 'notJoined') {
        dispatch(
          shoppingCartActions.addToCart({
            currentUserId,
            planId,
            dayId: day,
            mealId: status === 'notJoined' ? 'notJoined' : userOder?.foodId,
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
      const userOder = plan?.[day]?.memberOrder?.[currentUserId];
      const status = userOder?.status;
      if (status === 'joined' || status === 'notJoined') {
        dispatch(
          shoppingCartActions.addToCart({
            currentUserId,
            planId,
            dayId: day,
            mealId: status === 'notJoined' ? 'notJoined' : userOder?.foodId,
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
  async (data: { orderId: string; planId: string }, { getState, dispatch }) => {
    const { orderId, planId } = data;
    const { currentUser } = getState().user;
    const currentUserId = currentUser?.id?.uuid;
    const { orders } = getState().shoppingCart;
    const planData = orders?.[currentUserId]?.[planId];
    const orderDays = Object.keys(planData);

    const updatedPlan = orderDays.reduce((acc: any, curr: any) => {
      return {
        ...acc,
        [curr]: {
          [currentUserId]:
            // eslint-disable-next-line no-nested-ternary
            planData[curr] === EParticipantOrderStatus.notJoined
              ? {
                  status: EParticipantOrderStatus.notJoined,
                  foodId: '',
                }
              : planData[curr]
              ? {
                  status: EParticipantOrderStatus.joined,
                  foodId: planData[curr],
                }
              : {
                  status: EParticipantOrderStatus.empty,
                  foodId: '',
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

    await updateParticipantOrderApi(orderId, updateValues);
    await dispatch(reloadData(planId));
    return true;
  },
  {
    serializeError: storableError,
  },
);

export const ParticipantPlanThunks = { loadData, reloadData, updateOrder };

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
