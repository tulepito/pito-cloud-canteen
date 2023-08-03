import { createSlice } from '@reduxjs/toolkit';
import flatten from 'lodash/flatten';
import uniq from 'lodash/uniq';
import uniqBy from 'lodash/uniqBy';

import type { ParticipantSubOrderAddDocumentApiBody } from '@apis/firebaseApi';
import {
  participantGetNotificationsApi,
  participantSubOrderAddDocumentApi,
  participantSubOrderGetByIdApi,
  participantUpdateSeenNotificationApi,
} from '@apis/firebaseApi';
import { updateParticipantOrderApi } from '@apis/index';
import { participantPostRatingApi } from '@apis/participantApi';
import { fetchTxApi, queryTransactionApi } from '@apis/txApi';
import { disableWalkthroughApi, fetchSearchFilterApi } from '@apis/userApi';
import { getParticipantOrdersQuery } from '@helpers/listingSearchQuery';
import { markColorForOrder } from '@helpers/orderHelper';
import { createAsyncThunk } from '@redux/redux.helper';
import { userThunks } from '@redux/slices/user.slice';
import {
  CurrentUser,
  denormalisedResponseEntities,
  Listing,
} from '@src/utils/data';
import { getEndOfMonth } from '@src/utils/dates';
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

  subOrderTxs: TTransaction[];
  fetchSubOrderTxInProgress: boolean;
  fetchSubOrderTxError: any;

  colorOrderMap: TObject;

  participantPostRatingInProgress: boolean;
  participantPostRatingError: any;

  addSubOrderDocumentToFirebaseInProgress: boolean;
  addSubOrderDocumentToFirebaseError: any;

  updateSubOrderInProgress: boolean;
  updateSubOrderError: any;

  subOrderDocument: any;
  fetchSubOrderDocumentInProgress: boolean;
  fetchSubOrderDocumentError: any;

  participantFirebaseNotifications: any[];
  fetchParticipantFirebaseNotificationsInProgress: boolean;
  fetchParticipantFirebaseNotificationsError: any;
  restaurants: TListing[];
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

  subOrderTxs: [],
  fetchSubOrderTxInProgress: false,
  fetchSubOrderTxError: null,

  colorOrderMap: {},

  participantPostRatingInProgress: false,
  participantPostRatingError: null,

  addSubOrderDocumentToFirebaseInProgress: false,
  addSubOrderDocumentToFirebaseError: null,

  updateSubOrderInProgress: false,
  updateSubOrderError: null,

  subOrderDocument: {},
  fetchSubOrderDocumentInProgress: false,
  fetchSubOrderDocumentError: null,

  participantFirebaseNotifications: [],
  fetchParticipantFirebaseNotificationsInProgress: false,
  fetchParticipantFirebaseNotificationsError: null,

  restaurants: [],
};

// ================ Thunk types ================ //
const FETCH_ATTRIBUTES = 'app/ParticipantOrderList/FETCH_ATTRIBUTES';
const UPDATE_PROFILE = 'app/ParticipantOrderList/UPDATE_PROFILE';
const DISABLE_WALKTHROUGH = 'app/ParticipantOrderList/DISABLE_WALKTHROUGH';
const FETCH_ORDERS = 'app/ParticipantOrderList/FETCH_ORDERS';
const UPDATE_SUB_ORDER = 'app/ParticipantOrderList/UPDATE_SUB_ORDER';
const FETCH_TRANSACTION_BY_SUB_ORDER =
  'app/ParticipantOrderList/FETCH_TRANSACTION_BY_SUB_ORDER';
const POST_PARTICIPANT_RATING =
  'app/ParticipantOrderList/POST_PARTICIPANT_RATING';
const ADD_SUB_ORDER_DOCUMENT_TO_FIREBASE =
  'app/ParticipantOrderList/ADD_SUB_ORDER_DOCUMENT_TO_FIREBASE';
const FETCH_SUB_ORDERS_FROM_FIREBASE =
  'app/ParticipantOrderList/FETCH_SUB_ORDERS_FROM_FIREBASE';
const FETCH_PARTICIPANT_FIREBASE_NOTIFICATIONS =
  'app/FETCH_PARTICIPANT_FIREBASE_NOTIFICATIONS';
const UPDATE_SEEN_NOTIFICATION_STATUS_TO_FIREBASE =
  'app/UPDATE_SEEN_NOTIFICATION_STATUS_TO_FIREBASE';
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
  async ({ userId, selectedMonth }: TObject, { extra: sdk, getState }) => {
    const { currentUser } = getState().user;
    const query = getParticipantOrdersQuery({
      userId,
      startDate: selectedMonth.getTime(),
      endDate: getEndOfMonth(selectedMonth).getTime(),
    });
    const response = await sdk.listings.query(query);
    const orders = denormalisedResponseEntities(response);

    const allPlansIdList = orders.map((order: TListing) => {
      const orderListing = Listing(order);
      const { plans = [] } = orderListing.getMetadata();

      return plans[0];
    });
    const allPlans = denormalisedResponseEntities(
      await sdk.listings.query({
        ids: allPlansIdList,
      }),
    );
    const allRelatedRestaurantsIdList = uniq(
      allPlans.map((plan: TListing) => {
        const planListing = Listing(plan);
        const { orderDetail = {} } = planListing.getMetadata();

        return Object.values(orderDetail).map(
          (subOrder: any) => subOrder?.restaurant?.id,
        );
      }),
    );
    const allRelatedRestaurants = denormalisedResponseEntities(
      await sdk.listings.query({
        ids: allRelatedRestaurantsIdList,
      }),
    );
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
    const currentUserGetter = CurrentUser(currentUser!);
    const { companyList } = currentUserGetter.getMetadata();
    const { data: transactions } = await queryTransactionApi({
      dataParams: {
        createdAtEnd: getEndOfMonth(selectedMonth),
        companyId: companyList[0],
      },
    });

    return {
      orders,
      allPlans: flatten(allPlans),
      restaurants: allRelatedRestaurants,
      mappingSubOrderToOrder,
      subOrderTxs: transactions,
    };
  },
);

const updateSubOrder = createAsyncThunk(
  UPDATE_SUB_ORDER,
  async (data: { orderId: string; updateValues: TObject }, { getState }) => {
    const { allPlans } = getState().ParticipantOrderList;
    const { orderId, updateValues } = data;
    const { data: updateResponse } = await updateParticipantOrderApi(
      orderId,
      updateValues,
    );

    const { plan } = updateResponse;

    const newAllPlans = allPlans.map((oldPlan: any) => {
      if (oldPlan.id.uuid === plan.id.uuid) {
        return plan;
      }

      return oldPlan;
    });

    return {
      allPlans: newAllPlans,
    };
  },
);

const fetchTransactionBySubOrder = createAsyncThunk(
  FETCH_TRANSACTION_BY_SUB_ORDER,
  async (txIds: string[], { getState }) => {
    const { subOrderTxs = [] } = getState().ParticipantOrderList;
    const subOrderTxsIds = subOrderTxs.map((tx: TTransaction) => tx.id.uuid);
    if (txIds.length === 0) return subOrderTxs;
    const shouldFetchSubOrderTxs = txIds.filter(
      (txId: string) => !subOrderTxsIds.includes(txId),
    );

    const txsResponse = await Promise.all(
      shouldFetchSubOrderTxs.map(async (txId: string) => {
        const { data: txResponse } = await fetchTxApi(txId);

        return txResponse;
      }),
    );

    const newSubOrderTxs: TTransaction[] = uniqBy(
      subOrderTxs.concat(txsResponse),
      'id.uuid',
    );

    return newSubOrderTxs;
  },
);

const postParticipantRating = createAsyncThunk(
  POST_PARTICIPANT_RATING,
  async (payload: any, { getState }) => {
    const { images } = getState().uploadImage;
    const bodyApi = {
      ...payload,
      imageIdList: Object.values(images).map((image: any) => image.imageId),
    };

    const { data: response } = await participantPostRatingApi(bodyApi);

    return response;
  },
);

const addSubOrderDocumentToFirebase = createAsyncThunk(
  ADD_SUB_ORDER_DOCUMENT_TO_FIREBASE,
  async (payload: ParticipantSubOrderAddDocumentApiBody) => {
    await participantSubOrderAddDocumentApi(payload);
  },
);

const fetchSubOrdersFromFirebase = createAsyncThunk(
  FETCH_SUB_ORDERS_FROM_FIREBASE,
  async (subOrderId: string) => {
    const { data: response } = await participantSubOrderGetByIdApi(subOrderId);

    return response || {};
  },
);
const fetchParticipantFirebaseNotifications = createAsyncThunk(
  FETCH_PARTICIPANT_FIREBASE_NOTIFICATIONS,
  async () => {
    const { data: response } = await participantGetNotificationsApi();

    return response || [];
  },
);

const updateSeenNotificationStatusToFirebase = createAsyncThunk(
  UPDATE_SEEN_NOTIFICATION_STATUS_TO_FIREBASE,
  async (notificationId: string) => {
    await participantUpdateSeenNotificationApi(notificationId);
  },
);

export const OrderListThunks = {
  fetchAttributes,
  updateProfile,
  disableWalkthrough,
  fetchOrders,
  fetchTransactionBySubOrder,
  postParticipantRating,
  addSubOrderDocumentToFirebase,
  updateSubOrder,
  fetchSubOrdersFromFirebase,
  fetchParticipantFirebaseNotifications,
  updateSeenNotificationStatusToFirebase,
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
    seenNotification: (state, action) => {
      const notificationId = action.payload;
      const { participantFirebaseNotifications } = state;
      const newNotifications = participantFirebaseNotifications.map(
        (notification) => {
          if (notification.id === notificationId) {
            return {
              ...notification,
              seen: true,
            };
          }

          return notification;
        },
      );

      return {
        ...state,
        participantFirebaseNotifications: newNotifications,
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
      .addCase(fetchAttributes.rejected, (state, { error }) => {
        state.fetchAttributesInProgress = false;
        state.fetchAttributesError = error.message;
      })

      .addCase(updateProfile.pending, (state) => {
        state.updateProfileInProgress = true;
        state.updateProfileError = false;
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.updateProfileInProgress = false;
      })
      .addCase(updateProfile.rejected, (state, { error }) => {
        state.updateProfileInProgress = false;
        state.updateProfileError = error.message;
      })

      .addCase(disableWalkthrough.pending, (state) => {
        state.disableWalkthroughInProgress = true;
        state.disableWalkthroughError = false;
      })
      .addCase(disableWalkthrough.fulfilled, (state) => {
        state.disableWalkthroughInProgress = false;
      })
      .addCase(disableWalkthrough.rejected, (state, { error }) => {
        state.disableWalkthroughInProgress = false;
        state.disableWalkthroughError = error.message;
      })

      .addCase(fetchOrders.pending, (state) => {
        state.fetchOrdersInProgress = true;
        state.fetchOrdersError = false;
      })
      .addCase(fetchOrders.fulfilled, (state, { payload }) => {
        state.fetchOrdersInProgress = false;
        state.orders = uniqBy([...state.orders, ...payload.orders], 'id.uuid');
        state.subOrderTxs = uniqBy(
          [...state.subOrderTxs, ...payload.subOrderTxs],
          'id.uuid',
        );
        state.restaurants = payload.restaurants;
        state.allPlans = uniqBy(
          [...state.allPlans, ...payload.allPlans],
          'id.uuid',
        );
        state.mappingSubOrderToOrder = {
          ...state.mappingSubOrderToOrder,
          ...payload.mappingSubOrderToOrder,
        };
      })
      .addCase(fetchOrders.rejected, (state, { error }) => {
        state.fetchOrdersInProgress = false;
        state.fetchOrdersError = error.message;
      })

      .addCase(fetchTransactionBySubOrder.pending, (state) => {
        state.fetchSubOrderTxInProgress = true;
        state.fetchSubOrderTxError = false;
      })
      .addCase(fetchTransactionBySubOrder.fulfilled, (state, { payload }) => {
        state.fetchSubOrderTxInProgress = false;
        state.subOrderTxs = payload;
      })
      .addCase(fetchTransactionBySubOrder.rejected, (state, { error }) => {
        state.fetchSubOrderTxInProgress = false;
        state.fetchSubOrderTxError = error.message;
      })

      .addCase(postParticipantRating.pending, (state) => {
        state.participantPostRatingInProgress = true;
        state.participantPostRatingError = false;
      })
      .addCase(postParticipantRating.fulfilled, (state) => {
        state.participantPostRatingInProgress = false;
      })
      .addCase(postParticipantRating.rejected, (state, { error }) => {
        state.participantPostRatingInProgress = false;
        state.participantPostRatingError = error.message;
      })

      .addCase(addSubOrderDocumentToFirebase.pending, (state) => {
        state.addSubOrderDocumentToFirebaseInProgress = true;
        state.addSubOrderDocumentToFirebaseError = false;
      })
      .addCase(addSubOrderDocumentToFirebase.fulfilled, (state) => {
        state.addSubOrderDocumentToFirebaseInProgress = false;
      })
      .addCase(addSubOrderDocumentToFirebase.rejected, (state, { error }) => {
        state.addSubOrderDocumentToFirebaseInProgress = false;
        state.addSubOrderDocumentToFirebaseError = error.message;
      })

      .addCase(updateSubOrder.pending, (state) => {
        state.updateSubOrderInProgress = true;
        state.updateSubOrderError = false;
      })
      .addCase(updateSubOrder.fulfilled, (state, { payload }) => {
        state.updateSubOrderInProgress = false;
        state.allPlans = payload.allPlans;
      })
      .addCase(updateSubOrder.rejected, (state, { error }) => {
        state.updateSubOrderInProgress = false;
        state.updateSubOrderError = error.message;
      })

      .addCase(fetchSubOrdersFromFirebase.pending, (state) => {
        state.fetchSubOrderDocumentInProgress = true;
        state.fetchSubOrderDocumentError = false;
      })

      .addCase(fetchSubOrdersFromFirebase.fulfilled, (state, { payload }) => {
        state.fetchSubOrderDocumentInProgress = false;
        state.subOrderDocument = payload;
      })
      .addCase(fetchSubOrdersFromFirebase.rejected, (state, { error }) => {
        state.fetchSubOrderDocumentInProgress = false;
        state.fetchSubOrderDocumentError = error.message;
      })
      .addCase(fetchParticipantFirebaseNotifications.pending, (state) => {
        state.fetchParticipantFirebaseNotificationsInProgress = true;
        state.fetchParticipantFirebaseNotificationsError = false;
      })
      .addCase(
        fetchParticipantFirebaseNotifications.fulfilled,
        (state, { payload }) => {
          state.fetchParticipantFirebaseNotificationsInProgress = false;
          state.participantFirebaseNotifications = payload;
        },
      )
      .addCase(
        fetchParticipantFirebaseNotifications.rejected,
        (state, { error }) => {
          state.fetchParticipantFirebaseNotificationsInProgress = false;
          state.fetchParticipantFirebaseNotificationsError = error.message;
        },
      );
  },
});

// ================ Actions ================ //
export const OrderListActions = OrderListSlice.actions;
export default OrderListSlice.reducer;

// ================ Selectors ================ //
