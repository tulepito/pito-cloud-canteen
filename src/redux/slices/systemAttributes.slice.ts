import { createSlice } from '@reduxjs/toolkit';

import { showAttributesApi } from '@apis/attributes';
import { createAsyncThunk } from '@redux/redux.helper';
import config from '@src/configs';
import { denormalisedResponseEntities, Listing } from '@src/utils/data';
import { EOrderDraftStates, EOrderStates } from '@src/utils/enums';

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
  deliveryPeople: {
    key: string;
    name: string;
    phoneNumber: string;
  }[];

  fetchAttributesInProgress: boolean;
  fetchAttributesError: boolean;

  systemServiceFeePercentage: number;
  systemVATPercentage: number;

  currentOrderVATPercentage: number;
  fetchingOrderVATPercentage: boolean;
  fetchOrderVATError: any;
};
const initialState: TAttributesState = {
  menuTypes: [],
  categories: [],
  daySessions: [],
  packaging: [],
  nutritions: [],
  deliveryPeople: [],

  fetchAttributesInProgress: false,
  fetchAttributesError: false,

  systemServiceFeePercentage: 0,
  systemVATPercentage: 0,

  currentOrderVATPercentage: config.VATPercentage,
  fetchOrderVATError: null,
  fetchingOrderVATPercentage: false,
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

const fetchVATPercentageByOrderId = createAsyncThunk(
  'app/SystemAttributes/FETCH_VAT_PERCENTAGE_BY_ORDER_ID',
  async (orderId: string, { extra: sdk, getState }) => {
    const order = denormalisedResponseEntities(
      await sdk.listings.show({
        id: orderId,
      }),
    )[0];

    const { orderState, orderVATPercentage = 0 } = Listing(order).getMetadata();
    const { systemVATPercentage = 0 } = getState().SystemAttributes;

    const orderVATPercentageToUse =
      orderState === EOrderStates.picking ||
      orderState === EOrderDraftStates.draft
        ? systemVATPercentage
        : orderVATPercentage;

    return orderVATPercentageToUse;
  },
);

export const SystemAttributesThunks = {
  fetchAttributes,
  fetchVATPercentageByOrderId,
};

// ================ Slice ================ //
const SystemAttributesSlice = createSlice({
  name: 'SystemAttributes',
  initialState,
  reducers: {
    updateAttributes: (state, { payload }) => {
      return {
        ...state,
        ...payload,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttributes.pending, (state) => {
        state.fetchAttributesInProgress = true;
        state.fetchAttributesError = false;
      })
      .addCase(fetchAttributes.fulfilled, (state, { payload }) => {
        return { ...state, ...payload, fetchAttributesInProgress: false };
      })
      .addCase(fetchAttributes.rejected, (state) => {
        state.fetchAttributesInProgress = false;
        state.fetchAttributesError = true;
      })
      .addCase(fetchVATPercentageByOrderId.pending, (state) => {
        state.fetchingOrderVATPercentage = true;
        state.fetchOrderVATError = null;
      })
      .addCase(fetchVATPercentageByOrderId.fulfilled, (state, { payload }) => {
        state.currentOrderVATPercentage = payload || config.VATPercentage;
        state.fetchingOrderVATPercentage = false;
      })
      .addCase(fetchVATPercentageByOrderId.rejected, (state, { error }) => {
        state.fetchingOrderVATPercentage = false;
        state.fetchOrderVATError = error;
      });
  },
});

// ================ Actions ================ //
export const SystemAttributesActions = SystemAttributesSlice.actions;
export default SystemAttributesSlice.reducer;

// ================ Selectors ================ //
