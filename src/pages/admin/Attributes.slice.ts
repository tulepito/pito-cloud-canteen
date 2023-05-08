import { createSlice } from '@reduxjs/toolkit';

import {
  addAttributesApi,
  deleteAttributesApi,
  getAttributesApi,
  updateAttributesApi,
} from '@apis/admin';
import { createAsyncThunk } from '@redux/redux.helper';

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
  menuTypes: TKeyValue[];
  categories: TKeyValue[];
  daySessions: TKeyValue[];
  packaging: TKeyValue[];
  nutritions: TKeyValue[];

  fetchAttributesInProgress: boolean;
  fetchAttributesError: boolean;

  updateAttributeInProgress: boolean;
  updateAttributeError: boolean;
};
const initialState: TAttributesState = {
  menuTypes: [],
  categories: [],
  daySessions: [],
  packaging: [],
  nutritions: [],

  fetchAttributesInProgress: false,
  fetchAttributesError: false,

  updateAttributeInProgress: false,
  updateAttributeError: false,
};

// ================ Thunk types ================ //
const FETCH_ATTRIBUTES = 'app/Attributes/FETCH_ATTRIBUTES';
const ADD_ATTRIBUTES = 'app/Attributes/ADD_ATTRIBUTES';
const UPDATE_ATTRIBUTES = 'app/Attributes/UPDATE_ATTRIBUTES';
const DELETE_ATTRIBUTES = 'app/Attributes/DELETE_ATTRIBUTES';

// ================ Async thunks ================ //
const fetchAttributes = createAsyncThunk(FETCH_ATTRIBUTES, async () => {
  const { data: response } = await getAttributesApi();

  return response;
});

const addAttributes = createAsyncThunk(
  ADD_ATTRIBUTES,
  async (params: TAttributesParams) => {
    const { data: response } = await addAttributesApi(params);

    return response;
  },
);

const updateAttributes = createAsyncThunk(
  UPDATE_ATTRIBUTES,
  async (params: TAttributesParams) => {
    const { data: response } = await updateAttributesApi(params);

    return response;
  },
);

const deleteAttributes = createAsyncThunk(
  DELETE_ATTRIBUTES,
  async (params: TAttributesParams) => {
    const { data: response } = await deleteAttributesApi(params);

    return response;
  },
);

export const AdminAttributesThunks = {
  fetchAttributes,
  addAttributes,
  updateAttributes,
  deleteAttributes,
};

// ================ Slice ================ //
const AttributesSlice = createSlice({
  name: 'Attributes',
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
        } = action.payload;
        state.categories = categories;
        state.packaging = packaging;
        state.daySessions = daySessions;
        state.nutritions = nutritions;
        state.fetchAttributesInProgress = false;
      })
      .addCase(fetchAttributes.rejected, (state) => {
        state.fetchAttributesInProgress = false;
        state.fetchAttributesError = true;
      })

      .addCase(addAttributes.pending, (state) => {
        state.updateAttributeInProgress = true;
        state.updateAttributeError = false;
      })
      .addCase(addAttributes.fulfilled, (state, action) => {
        const {
          categories = [],
          packaging = [],

          daySessions = [],
          nutritions = [],
        } = action.payload;
        state.categories = categories;
        state.packaging = packaging;
        state.daySessions = daySessions;
        state.nutritions = nutritions;
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
      .addCase(updateAttributes.fulfilled, (state, action) => {
        const {
          categories = [],
          packaging = [],
          daySessions = [],
          nutritions = [],
        } = action.payload;
        state.categories = categories;
        state.packaging = packaging;
        state.daySessions = daySessions;
        state.nutritions = nutritions;
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
      .addCase(deleteAttributes.fulfilled, (state, action) => {
        const {
          categories = [],
          packaging = [],
          daySessions = [],
          nutritions = [],
        } = action.payload;
        state.categories = categories;
        state.packaging = packaging;
        state.daySessions = daySessions;
        state.nutritions = nutritions;
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
