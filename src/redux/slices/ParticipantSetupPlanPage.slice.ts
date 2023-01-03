import { createAsyncThunk } from '@redux/redux.helper';
import { createSlice } from '@reduxjs/toolkit';
import { storableError } from '@utils/errors';

import { loadPlanDataApi, updateParticipantOrderApi } from '../../utils/api';
import { shopingCartActions } from './shopingCart.slice';

const LOAD_DATA = 'app/ParticipantSetupPlanPage/LOAD_DATA';
const UPDATE_ORDER = 'app/ParticipantSetupPlanPage/UPDATE_ORDER';

interface ParticipantSetupPlanState {
  restaurant: any;
  company: any;
  plan: any;
  order: any;
  loadDataInProgress: boolean;
  loadDataError: any;
}

const initialState: ParticipantSetupPlanState = {
  restaurant: {},
  company: {},
  plan: {},
  order: {},
  loadDataInProgress: false,
  loadDataError: null,
};

const loadData = createAsyncThunk(
  LOAD_DATA,
  async (planId: string, { getState, dispatch }) => {
    const currentUser = getState().user.currentUser;
    const currentUserId = currentUser?.id?.uuid;
    const response: any = await loadPlanDataApi(planId);
    const plan = response?.data?.data?.plan;
    const orderDaysRaw = Object.keys(plan);
    const orderDays = orderDaysRaw.filter(
      (day) => plan?.[day]?.memberOrder?.[currentUserId]?.foodId,
    );

    orderDays.forEach((day) => {
      dispatch(
        shopingCartActions.addToCart({
          currentUserId: currentUserId,
          planId,
          dayId: day,
          mealId: plan?.[day]?.memberOrder?.[currentUserId]?.foodId,
        }),
      );
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
    const currentUser = getState().user.currentUser;
    const currentUserId = currentUser?.id?.uuid;
    const orders = getState().shopingCart.orders;
    const planData = orders?.[currentUserId]?.[planId];
    const orderDaysRaw = Object.keys(planData);
    const orderDays = orderDaysRaw.filter((item: any) => planData[item]);

    const updatedPlan = orderDays.reduce((acc: any, curr: any) => {
      acc[curr] = {
        [currentUserId]: {
          status: 'joined',
          foodId: planData[curr],
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
      }));
  },
});

export default participantSetupPlanSlice.reducer;
