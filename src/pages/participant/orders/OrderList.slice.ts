import { createSlice } from '@reduxjs/toolkit';

import { disableWalkthroughApi, fetchSearchFilterApi } from '@apis/userApi';
import { createAsyncThunk } from '@redux/redux.helper';
import { userThunks } from '@redux/slices/user.slice';
import type { TKeyValue } from '@src/utils/types';

// ================ Initial states ================ //
type TOrderListState = {
  nutritions: TKeyValue[];
  fetchAttributesInProgress: boolean;
  fetchAttributesError: any;

  updateProfileInProgress: boolean;
  updateProfileError: any;

  walkthroughCurrentStep: number;
  disableWalkthroughInProgress: boolean;
  disableWalkthroughError: any;
};
const initialState: TOrderListState = {
  nutritions: [],
  fetchAttributesInProgress: false,
  fetchAttributesError: null,

  updateProfileInProgress: false,
  updateProfileError: null,

  walkthroughCurrentStep: 0,
  disableWalkthroughInProgress: false,
  disableWalkthroughError: null,
};

// ================ Thunk types ================ //
const FETCH_ATTRIBUTES = 'app/ParticipantOrderList/FETCH_ATTRIBUTES';
const UPDATE_PROFILE = 'app/ParticipantOrderList/UPDATE_PROFILE';
const DISABLE_WALKTHROUGH = 'app/ParticipantOrderList/DISABLE_WALKTHROUGH';
// ================ Async thunks ================ //
const fetchAttributes = createAsyncThunk(FETCH_ATTRIBUTES, async () => {
  const { data: response } = await fetchSearchFilterApi();

  return response;
});

const updateProfile = createAsyncThunk(
  UPDATE_PROFILE,
  async (payload: any, { extra: sdk, dispatch }) => {
    await sdk.currentUser.updateProfile(payload);
    await dispatch(userThunks.fetchCurrentUser());
  },
);

const disableWalkthrough = createAsyncThunk(
  DISABLE_WALKTHROUGH,
  async (userId: string, { dispatch }) => {
    await disableWalkthroughApi(userId);
    await dispatch(userThunks.fetchCurrentUser());
  },
);

export const OrderListThunks = {
  fetchAttributes,
  updateProfile,
  disableWalkthrough,
};

// ================ Slice ================ //
const OrderListSlice = createSlice({
  name: 'ParticipantOrderList',
  initialState,
  reducers: {
    changeWalkthroughCurrentStep: (state, action) => {
      state.walkthroughCurrentStep = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttributes.pending, (state) => {
        state.fetchAttributesInProgress = true;
        state.fetchAttributesError = false;
      })
      .addCase(fetchAttributes.fulfilled, (state, action) => {
        const { nutritions = [] } = action.payload;
        state.nutritions = nutritions;
        state.fetchAttributesInProgress = false;
      })
      .addCase(fetchAttributes.rejected, (state) => {
        state.fetchAttributesInProgress = false;
        state.fetchAttributesError = true;
      })

      .addCase(updateProfile.pending, (state) => {
        state.updateProfileInProgress = true;
        state.updateProfileError = false;
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.updateProfileInProgress = false;
      })
      .addCase(updateProfile.rejected, (state) => {
        state.updateProfileInProgress = false;
        state.updateProfileError = true;
      })

      .addCase(disableWalkthrough.pending, (state) => {
        state.disableWalkthroughInProgress = true;
        state.disableWalkthroughError = false;
      })
      .addCase(disableWalkthrough.fulfilled, (state) => {
        state.disableWalkthroughInProgress = false;
      })
      .addCase(disableWalkthrough.rejected, (state) => {
        state.disableWalkthroughInProgress = false;
        state.disableWalkthroughError = true;
      });
  },
});

// ================ Actions ================ //
export const OrderListActions = OrderListSlice.actions;
export default OrderListSlice.reducer;

// ================ Selectors ================ //
