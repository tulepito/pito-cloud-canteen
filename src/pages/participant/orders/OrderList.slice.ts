import type { Event } from 'react-big-calendar';
import { createSlice } from '@reduxjs/toolkit';
import flatten from 'lodash/flatten';

import { loadOrderDataApi } from '@apis/index';
import { fetchTxApi } from '@apis/txApi';
import { disableWalkthroughApi, fetchSearchFilterApi } from '@apis/userApi';
import { getParticipantOrdersQuery } from '@helpers/listingSearchQuery';
import { markColorForOrder } from '@helpers/orderHelper';
import { createAsyncThunk } from '@redux/redux.helper';
import { userThunks } from '@redux/slices/user.slice';
import { denormalisedResponseEntities, Listing } from '@src/utils/data';
import { convertStringToNumber } from '@src/utils/number';
import type {
  TKeyValue,
  TListing,
  TObject,
  TTransaction,
} from '@src/utils/types';

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

  orders: any[];
  allSubOrders: any[];
  allPlans: any[];
  mappingSubOrderToOrder: TObject;
  fetchOrdersInProgress: boolean;
  fetchOrdersError: any;

  subOrderTx: TTransaction;
  fetchSubOrderTxInProgress: boolean;
  fetchSubOrderTxError: any;

  colorOrderMap: TObject;
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

  orders: [],
  allSubOrders: [],
  allPlans: [],
  mappingSubOrderToOrder: {},
  fetchOrdersInProgress: false,
  fetchOrdersError: null,

  subOrderTx: null!,
  fetchSubOrderTxInProgress: false,
  fetchSubOrderTxError: null,

  colorOrderMap: {},
};

// ================ Thunk types ================ //
const FETCH_ATTRIBUTES = 'app/ParticipantOrderList/FETCH_ATTRIBUTES';
const UPDATE_PROFILE = 'app/ParticipantOrderList/UPDATE_PROFILE';
const DISABLE_WALKTHROUGH = 'app/ParticipantOrderList/DISABLE_WALKTHROUGH';
const FETCH_ORDERS = 'app/ParticipantOrderList/FETCH_ORDERS';
const FETCH_TRANSACTION_BY_SUB_ORDER =
  'app/ParticipantOrderList/FETCH_TRANSACTION_BY_SUB_ORDER';
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

const fetchOrders = createAsyncThunk(
  FETCH_ORDERS,
  async (userId: string, { extra: sdk }) => {
    const query = getParticipantOrdersQuery({ userId });
    const response = await sdk.listings.query(query);
    const orders = denormalisedResponseEntities(response);
    const mappingSubOrderToOrder = orders.reduce(
      (result: any, order: TListing) => {
        const orderListing = Listing(order);
        const orderId = orderListing.getId();
        const { plans = [] } = orderListing.getMetadata();
        const planIdWithOrderId = plans.reduce(
          (mapping: any[], planId: string) => {
            return {
              ...mapping,
              [planId]: orderId,
            };
          },
          {},
        );

        return {
          ...result,
          ...planIdWithOrderId,
        };
      },
      {},
    );
    console.log('mappingSubOrderToOrder: ', mappingSubOrderToOrder);
    console.log('orders: ', orders);
    const allPlansData: Event[] = await Promise.all(
      orders.map(async (order: TListing) => {
        const orderListing = Listing(order);
        const orderId = orderListing.getId();
        const allOrderData = await loadOrderDataApi(orderId);
        const { subOrders, plans } = allOrderData.data.data;

        return { subOrders: flatten(subOrders), plans: flatten(plans) };
      }),
    );
    const allSubOrders = allPlansData.map(
      (planData: any) => planData.subOrders,
    );
    const allPlans = allPlansData.map((planData: any) => planData.plans);
    console.log('allSubOrders: ', flatten(allSubOrders));
    console.log('allPlans: ', flatten(allPlans));

    return {
      orders,
      allSubOrders: flatten(allSubOrders),
      allPlans: flatten(allPlans),
      mappingSubOrderToOrder,
    };
  },
);

const fetchTransactionBySubOrder = createAsyncThunk(
  FETCH_TRANSACTION_BY_SUB_ORDER,
  async (txId: string) => {
    if (!txId) return null;
    const txResponse = await fetchTxApi(txId);
    console.log('txResponse: ', txResponse);
    console.log('txResponse data: ', txResponse.data);

    return txResponse.data;
  },
);

export const OrderListThunks = {
  fetchAttributes,
  updateProfile,
  disableWalkthrough,
  fetchOrders,
  fetchTransactionBySubOrder,
};

// ================ Slice ================ //
const OrderListSlice = createSlice({
  name: 'ParticipantOrderList',
  initialState,
  reducers: {
    changeWalkthroughCurrentStep: (state, action) => {
      state.walkthroughCurrentStep = action.payload;
    },
    markColorToOrder: (state) => {
      const { orders } = state;
      const colorOrderMap = orders.reduce((result, order) => {
        const orderListing = Listing(order);
        const { title: orderTitle } = orderListing.getAttributes();
        const orderTitleNumber = convertStringToNumber(orderTitle);
        const orderColor = markColorForOrder(orderTitleNumber);

        return {
          ...result,
          [order.id.uuid]: orderColor,
        };
      }, {});

      return {
        ...state,
        colorOrderMap,
      };
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
      })

      .addCase(fetchOrders.pending, (state) => {
        state.fetchOrdersInProgress = true;
        state.fetchOrdersError = false;
      })
      .addCase(fetchOrders.fulfilled, (state, { payload }) => {
        state.fetchOrdersInProgress = false;
        state.orders = payload.orders;
        state.allSubOrders = payload.allSubOrders;
        state.allPlans = payload.allPlans;
        state.mappingSubOrderToOrder = payload.mappingSubOrderToOrder;
      })
      .addCase(fetchOrders.rejected, (state) => {
        state.fetchOrdersInProgress = false;
        state.fetchOrdersError = true;
      })

      .addCase(fetchTransactionBySubOrder.pending, (state) => {
        state.fetchSubOrderTxInProgress = true;
        state.fetchSubOrderTxError = false;
      })
      .addCase(fetchTransactionBySubOrder.fulfilled, (state, { payload }) => {
        state.fetchSubOrderTxInProgress = false;
        state.subOrderTx = payload;
      })
      .addCase(fetchTransactionBySubOrder.rejected, (state) => {
        state.fetchSubOrderTxInProgress = false;
        state.fetchSubOrderTxError = true;
      });
  },
});

// ================ Actions ================ //
export const OrderListActions = OrderListSlice.actions;
export default OrderListSlice.reducer;

// ================ Selectors ================ //
