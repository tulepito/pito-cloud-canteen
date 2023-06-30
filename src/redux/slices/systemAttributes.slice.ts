import { createSlice } from '@reduxjs/toolkit';

import { showAttributesApi } from '@apis/attributes';
import { createAsyncThunk } from '@redux/redux.helper';

// ================ Initial states ================ //
type TKeyValue<T = string> = {
  key: string;
  label: T;
};

type TAttributesState = {
  menuTypes: TKeyValue[];
  categories: TKeyValue[];
  daySessions: TKeyValue[];
  packaging: TKeyValue[];
  nutritions: TKeyValue[];

  fetchAttributesInProgress: boolean;
  fetchAttributesError: boolean;

  systemServiceFeePercentage: number;
  systemVATPercentage: number;
};
const initialState: TAttributesState = {
  menuTypes: [],
  categories: [],
  daySessions: [],
  packaging: [],
  nutritions: [],

  fetchAttributesInProgress: false,
  fetchAttributesError: false,

  systemServiceFeePercentage: 0,
  systemVATPercentage: 0,
};

// ================ Thunk types ================ //

// ================ Async thunks ================ //
const fetchAttributes = createAsyncThunk(
  'app/SystemAttributes/FETCH_ATTRIBUTES',
  async (_) => {
    const { data: response } = await showAttributesApi();

    return response;
  },
);

export const SystemAttributesThunks = {
  fetchAttributes,
};

// ================ Slice ================ //
const SystemAttributesSlice = createSlice({
  name: 'SystemAttributes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttributes.pending, (state) => {
        state.fetchAttributesInProgress = true;
        state.fetchAttributesError = false;
      })
      .addCase(fetchAttributes.fulfilled, (state, action) => {
        const {
          categories = [],
          packaging = [],
          daySessions = [],
          nutritions = [],
          systemVATPercentage = 0,
          systemServiceFeePercentage,
        } = action.payload;
        state.categories = categories;
        state.packaging = packaging;
        state.daySessions = daySessions;
        state.nutritions = nutritions;
        state.fetchAttributesInProgress = false;
        state.systemVATPercentage = systemVATPercentage;
        state.systemServiceFeePercentage = systemServiceFeePercentage;
      })
      .addCase(fetchAttributes.rejected, (state) => {
        state.fetchAttributesInProgress = false;
        state.fetchAttributesError = true;
      });
  },
});

// ================ Actions ================ //
export const SystemAttributesActions = SystemAttributesSlice.actions;
export default SystemAttributesSlice.reducer;

// ================ Selectors ================ //
