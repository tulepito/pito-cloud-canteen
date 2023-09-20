import { createSlice } from '@reduxjs/toolkit';

import {
  addAttributesApi,
  deleteAttributesApi,
  updateAttributesApi,
} from '@apis/admin';
import { createAsyncThunk } from '@redux/redux.helper';
import { SystemAttributesActions } from '@redux/slices/systemAttributes.slice';

// ================ Initial states ================ //
type TKeyValue<T = string> = {
  key: string;
  label: T;
  time?: {
    start: string;
    end: string;
  };
};

type TAttributesParams = {
  categories?: TKeyValue[];
  daySessions?: TKeyValue[];
  packaging?: TKeyValue[];
  nutritions?: TKeyValue[];
  time?: {
    start: string;
    end: string;
  };
};

type TAttributesState = {
  updateAttributeInProgress: boolean;
  updateAttributeError: boolean;
};
const initialState: TAttributesState = {
  updateAttributeInProgress: false,
  updateAttributeError: false,
};

// ================ Thunk types ================ //
const ADD_ATTRIBUTES = 'app/AdminAttributes/ADD_ATTRIBUTES';
const UPDATE_ATTRIBUTES = 'app/AdminAttributes/UPDATE_ATTRIBUTES';
const DELETE_ATTRIBUTES = 'app/AdminAttributes/DELETE_ATTRIBUTES';

// ================ Async thunks ================ //
const addAttributes = createAsyncThunk(
  ADD_ATTRIBUTES,
  async (params: TAttributesParams, { dispatch }) => {
    const { data: response } = await addAttributesApi(params);

    const {
      categories = [],
      packaging = [],
      daySessions = [],
      nutritions = [],
    } = response;

    dispatch(
      SystemAttributesActions.updateAttributes({
        categories,
        packaging,
        daySessions,
        nutritions,
      }),
    );

    return response;
  },
);

const updateAttributes = createAsyncThunk(
  UPDATE_ATTRIBUTES,
  async (params: TAttributesParams, { dispatch }) => {
    const { data: response } = await updateAttributesApi(params);

    const {
      categories = [],
      packaging = [],
      daySessions = [],
      nutritions = [],
    } = response;

    dispatch(
      SystemAttributesActions.updateAttributes({
        categories,
        packaging,
        daySessions,
        nutritions,
      }),
    );

    return response;
  },
);

const deleteAttributes = createAsyncThunk(
  DELETE_ATTRIBUTES,
  async (params: TAttributesParams, { dispatch }) => {
    const { data: response } = await deleteAttributesApi(params);

    const {
      categories = [],
      packaging = [],
      daySessions = [],
      nutritions = [],
    } = response;

    dispatch(
      SystemAttributesActions.updateAttributes({
        categories,
        packaging,
        daySessions,
        nutritions,
      }),
    );

    return response;
  },
);

export const AdminAttributesThunks = {
  addAttributes,
  updateAttributes,
  deleteAttributes,
};

// ================ Slice ================ //
const AttributesSlice = createSlice({
  name: 'AdminAttributes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addAttributes.pending, (state) => {
        state.updateAttributeInProgress = true;
        state.updateAttributeError = false;
      })
      .addCase(addAttributes.fulfilled, (state) => {
        state.updateAttributeInProgress = false;
      })
      .addCase(addAttributes.rejected, (state) => {
        state.updateAttributeInProgress = false;
        state.updateAttributeError = true;
      })

      .addCase(updateAttributes.pending, (state) => {
        state.updateAttributeInProgress = true;
        state.updateAttributeError = false;
      })
      .addCase(updateAttributes.fulfilled, (state) => {
        state.updateAttributeInProgress = false;
      })
      .addCase(updateAttributes.rejected, (state) => {
        state.updateAttributeInProgress = false;
        state.updateAttributeError = true;
      })

      .addCase(deleteAttributes.pending, (state) => {
        state.updateAttributeInProgress = true;
        state.updateAttributeError = false;
      })
      .addCase(deleteAttributes.fulfilled, (state) => {
        state.updateAttributeInProgress = false;
      })
      .addCase(deleteAttributes.rejected, (state) => {
        state.updateAttributeInProgress = false;
        state.updateAttributeError = true;
      });
  },
});

// ================ Actions ================ //
export const AttributesActions = AttributesSlice.actions;
export default AttributesSlice.reducer;

// ================ Selectors ================ //
