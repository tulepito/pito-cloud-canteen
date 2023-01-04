import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import { storableError } from '@utils/errors';

import { loadPlanDataApi, updateParticipantOrderApi } from '../../utils/api';
import { shopingCartActions, shopingCartThunks } from './shopingCart.slice';

const LOAD_DATA = 'app/ParticipantSetupPlanPage/LOAD_DATA';
const UPDATE_ORDER = 'app/ParticipantSetupPlanPage/UPDATE_ORDER';

interface ParticipantSetupPlanState {
  restaurant: any;
  company: any;
  plan: any;
  order: any;
  loadDataInProgress: boolean;
  loadDataError: any;
  submitDataInprogress: boolean;
  submitDataError: any;
}

const initialState: ParticipantSetupPlanState = {
  restaurant: {},
  company: {},
  plan: {},
  order: {},
  loadDataInProgress: false,
  loadDataError: null,
  submitDataInprogress: false,
  submitDataError: null,
};

const loadData = createAsyncThunk(
  LOAD_DATA,
  async (planId: string, { getState, dispatch }) => {
    const currentUser = getState().user.currentUser;
    const currentUserId = currentUser?.id?.uuid;
    const response: any = await loadPlanDataApi(planId);
    const plan = response?.data?.data?.plan;
    const orderDays = Object.keys(plan);

    dispatch(shopingCartThunks.removeAllFromPlanCart({ planId }));
    orderDays.forEach((day) => {
      const userOder = plan?.[day]?.memberOrder?.[currentUserId];
      const status = userOder?.status;
      if (status === 'joined' || status === 'notJoined') {
        dispatch(
          shopingCartActions.addToCart({
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
    const { orders } = getState().shopingCart;
    const planData = orders?.[currentUserId]?.[planId];
    const orderDays = Object.keys(planData);

    const updatedPlan = orderDays.reduce((acc: any, curr: any) => {
      acc[curr] = {
        [currentUserId]:
          planData[curr] === 'notJoined'
            ? {
                status: 'notJoined',
                foodId: '',
              }
            : planData[curr]
            ? {
                status: 'joined',
                foodId: planData[curr],
              }
            : {
                status: 'empty',
                foodId: '',
              },
      };
      return acc;
    }, {});

    const updateValues = {
      orderId,
      orderDays,
      planId,
      planData: updatedPlan,
    };

    await updateParticipantOrderApi(orderId, updateValues);
    await dispatch(loadData(planId));
    return true;
  },
  {
    serializeError: storableError,
  },
);

export const ParticipantSetupPlanThunks = { loadData, updateOrder };

const participantSetupPlanSlice = createSlice({
  name: 'ParticipantSetupPlanPage',
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

export default participantSetupPlanSlice.reducer;
