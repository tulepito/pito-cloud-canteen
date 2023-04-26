import { createSlice } from '@reduxjs/toolkit';

import { fetchSearchFilterApi } from '@apis/userApi';
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
};
const initialState: TOrderListState = {
  nutritions: [],
  fetchAttributesInProgress: false,
  fetchAttributesError: null,

  updateProfileInProgress: false,
  updateProfileError: null,
};

// ================ Thunk types ================ //
const FETCH_ATTRIBUTES = 'app/ParticipantOrderList/FETCH_ATTRIBUTES';
const UPDATE_PROFILE = 'app/ParticipantOrderList/UPDATE_PROFILE';
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

export const OrderListThunks = {
  fetchAttributes,
  updateProfile,
};

// ================ Slice ================ //
const OrderListSlice = createSlice({
  name: 'ParticipantOrderList',
  initialState,
  reducers: {},
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
      });
  },
});

// ================ Actions ================ //
export const OrderListActions = OrderListSlice.actions;
export default OrderListSlice.reducer;

// ================ Selectors ================ //
