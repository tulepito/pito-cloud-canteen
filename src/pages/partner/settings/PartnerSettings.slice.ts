import { createSlice } from '@reduxjs/toolkit';

import { fetchSearchFilterApi } from '@apis/userApi';
import { createAsyncThunk } from '@redux/redux.helper';
import type { TKeyValue } from '@src/utils/types';

// ================ Initial states ================ //
type TPartnerSettingsState = {
  nutritions: TKeyValue[];
  fetchAttributesInProgress: boolean;
  fetchAttributesError: any;
};
const initialState: TPartnerSettingsState = {
  nutritions: [],
  fetchAttributesInProgress: false,
  fetchAttributesError: null,
};

// ================ Thunk types ================ //
const FETCH_ATTRIBUTES = 'app/PartnerSettings/FETCH_ATTRIBUTES';

// ================ Async thunks ================ //

const fetchAttributes = createAsyncThunk(FETCH_ATTRIBUTES, async () => {
  const { data: response } = await fetchSearchFilterApi();

  return response;
});

export const PartnerSettingsThunks = {
  fetchAttributes,
};

// ================ Slice ================ //
const PartnerSettingsSlice = createSlice({
  name: 'PartnerSettings',
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
      });
  },
});

// ================ Actions ================ //
export const PartnerSettingsActions = PartnerSettingsSlice.actions;
export default PartnerSettingsSlice.reducer;

// ================ Selectors ================ //
