import { createSlice } from '@reduxjs/toolkit';
import { maxBy } from 'lodash';
import chunk from 'lodash/chunk';
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
import {
  participantPostRatingApi,
  recommendFoodForSubOrdersApi,
} from '@apis/participantApi';
import { fetchTxApi, queryTransactionApi } from '@apis/txApi';
import { disableWalkthroughApi, fetchSearchFilterApi } from '@apis/userApi';
import { convertListIdToQueries } from '@helpers/apiHelpers';
import {
  getFoodQuery,
  getParticipantOrdersQueries,
} from '@helpers/listingSearchQuery';
import { markColorForOrder } from '@helpers/orderHelper';
import { createAsyncThunk } from '@redux/redux.helper';
import { ParticipantOrderManagementActions } from '@redux/slices/ParticipantOrderManagementPage.slice';
import { userThunks } from '@redux/slices/user.slice';
import {
  CurrentUser,
  denormalisedResponseEntities,
  Listing,
} from '@src/utils/data';
import { getEndOfMonth } from '@src/utils/dates';
import { EParticipantOrderStatus, ESubOrderTxStatus } from '@src/utils/enums';
import { convertStringToNumber } from '@src/utils/number';
import type {
  TKeyValue,
  TListing,
  TObject,
  TTransaction,
  TUser,
} from '@src/utils/types';

import { SubOrdersThunks } from '../sub-orders/SubOrders.slice';

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

  pickFoodForSubOrdersInProgress: boolean;
  pickFoodForSubOrdersError: any;

  pickFoodForSpecificSubOrderInProgress: boolean;
  pickFoodForSpecificSubOrderError: any;

  company: TUser | null;
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

  pickFoodForSubOrdersInProgress: false,
  pickFoodForSubOrdersError: null,

  pickFoodForSpecificSubOrderInProgress: false,
  pickFoodForSpecificSubOrderError: null,

  company: null,
};

export const getFoodIdListWithSuitablePrice = ({
  payload,
  orders,
  allPlans,
}: {
  payload: {
    planId: string;
    orderId: string;
    subOrderDate: string;
  };
  orders: TListing[];
  allPlans: TListing[];
}) => {
  const { planId, subOrderDate, orderId } = payload;
  const order = orders.find((_order) => _order.id.uuid === orderId);
  const plan = allPlans.find((_plan) => _plan.id.uuid === planId);
  const orderListing = Listing(order!);
  const planListing = Listing(plan!);
  const { packagePerMember = 0 } = orderListing.getMetadata();
  const { orderDetail = {} } = planListing.getMetadata();
  const subOrder = orderDetail[subOrderDate];
  const { foodList } = subOrder.restaurant;
  const suitablePriceFoodList = Object.keys(foodList).reduce(
    (result: any, foodId: string) => {
      const food = foodList[foodId];
      const { foodPrice } = food;
      if (foodPrice <= packagePerMember) {
        result.push(foodId);
      }

      return result;
    },
    [],
  );

  return suitablePriceFoodList;
};

export const recommendFood = ({
  foodList,
  subOrderFoodIds,
  allergies,
}: {
  foodList: TListing[];
  subOrderFoodIds: string[];
  allergies: string[];
}) => {
  const subOrderFoodList = foodList.filter((food) =>
    subOrderFoodIds.includes(food.id.uuid),
  );

  const filteredFoodListByAllergies = subOrderFoodList.filter(
    (food) =>
      !allergies.some((allergy: string) =>
        Listing(food).getPublicData().allergies.includes(allergy),
      ),
  );

  const isAllFoodHaveAllergies = filteredFoodListByAllergies.length === 0;

  const foodListToFilter = isAllFoodHaveAllergies
    ? subOrderFoodList
    : filteredFoodListByAllergies;

  const isAllFoodHaveNoRating = foodListToFilter.every(
    (food) => !Listing(food).getMetadata().rating,
  );

  const mostSuitableFood = !isAllFoodHaveNoRating
    ? maxBy(
        foodListToFilter,
        (food) => Listing(food).getMetadata()?.rating || 0,
      )
    : maxBy(
        foodListToFilter,
        (food) => Listing(food).getMetadata()?.pickingTime || 0,
      );

  return mostSuitableFood;
};

const updateRecommendFoodToOrderDetail = ({
  allPlans,
  planId,
  currentUserGetter,
  groupedFood,
}: {
  allPlans: TListing[];
  planId: string;
  currentUserGetter: any;
  groupedFood: any;
}) => {
  const plan = allPlans.find((_plan) => _plan.id.uuid === planId);
  const planListing = Listing(plan!);
  const { orderDetail = {} } = planListing.getMetadata();
  const newOrderDetail = Object.keys(orderDetail).reduce(
    (newOrderDetailResult: any, subOrderDate: string) => {
      if (!groupedFood[planId][subOrderDate]?.id?.uuid)
        return {
          ...newOrderDetailResult,
          [subOrderDate]: {
            ...orderDetail[subOrderDate],
          },
        };

      return {
        ...newOrderDetailResult,
        [subOrderDate]: {
          ...orderDetail[subOrderDate],
          memberOrders: {
            ...orderDetail[subOrderDate]?.memberOrders,
            [currentUserGetter.getId()]: {
              foodId: groupedFood[planId][subOrderDate].id.uuid,
              status: EParticipantOrderStatus.joined,
            },
          },
        },
      };
    },
    {},
  );

  return newOrderDetail;
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
  'app/ParticipantOrderList/FETCH_PARTICIPANT_FIREBASE_NOTIFICATIONS';
const UPDATE_SEEN_NOTIFICATION_STATUS_TO_FIREBASE =
  'app/ParticipantOrderList/UPDATE_SEEN_NOTIFICATION_STATUS_TO_FIREBASE';
const PICK_FOOD_FOR_SUB_ORDERS =
  'app/ParticipantOrderList/PICK_FOOD_FOR_SUB_ORDERS';
const PICK_FOOD_FOR_SPECIFIC_SUB_ORDER =
  'app/ParticipantOrderList/PICK_FOOD_FOR_SPECIFIC_SUB_ORDER';

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
    const queries = getParticipantOrdersQueries({
      userId,
      startDate: selectedMonth.getTime(),
      endDate: getEndOfMonth(selectedMonth).getTime(),
    });
    const responses = await Promise.all(
      queries.map(async (query) =>
        denormalisedResponseEntities(await sdk.listings.query(query)),
      ),
    );
    const orders = flatten(responses);

    const allPlansIdList = orders.map((order: TListing) => {
      const orderListing = Listing(order);
      const { plans = [] } = orderListing.getMetadata();

      return plans[0];
    });

    const planQueries = convertListIdToQueries({ idList: allPlansIdList });
    const allPlans = flatten(
      await Promise.all(
        planQueries.map(async ({ ids }) => {
          return denormalisedResponseEntities(
            await sdk.listings.query({
              ids,
            }),
          );
        }),
      ),
    );
    const allRelatedRestaurantsIdList = uniq(
      flatten(
        allPlans.map((plan: TListing) => {
          const planListing = Listing(plan);
          const { orderDetail = {} } = planListing.getMetadata();

          return Object.values(orderDetail).map(
            (subOrder: any) => subOrder?.restaurant?.id,
          );
        }),
      ),
    );
    const allRelatedRestaurants = flatten(
      await Promise.all(
        convertListIdToQueries({ idList: allRelatedRestaurantsIdList }).map(
          async ({ ids }) => {
            return denormalisedResponseEntities(
              await sdk.listings.query({
                ids,
              }),
            );
          },
        ),
      ),
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
    const { companyList = [] } = currentUserGetter.getMetadata();
    const companyId = companyList[0] || null;
    let transactions = [];
    let company = null;
    if (companyId) {
      const { data } = await queryTransactionApi({
        dataParams: {
          createdAtEnd: getEndOfMonth(selectedMonth),
          companyId: companyList[0],
        },
      });
      transactions = data;
      const companyResponse = denormalisedResponseEntities(
        await sdk.users.show({
          id: companyList[0],
        }),
      )[0];
      company = companyResponse;
    }

    return {
      orders,
      allPlans,
      restaurants: allRelatedRestaurants,
      mappingSubOrderToOrder,
      subOrderTxs: transactions,
      company,
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
  async (payload: any, { getState, dispatch }) => {
    const { images } = getState().uploadImage;
    const { currentUser } = getState().user;
    const { planId, rating } = payload;
    const { timestamp } = rating;
    const bodyApi = {
      ...payload,
      imageIdList: Object.values(images).map((image: any) => image.imageId),
    };

    const { data: response } = await participantPostRatingApi(bodyApi);
    dispatch(
      SubOrdersThunks.fetchSubOrderFromFirebase({
        subOrderDocumentId: `${currentUser?.id.uuid} - ${planId} - ${timestamp}`,
        subOrderType: ESubOrderTxStatus.DELIVERED,
      }),
    );

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

const pickFoodForSubOrders = createAsyncThunk(
  PICK_FOOD_FOR_SUB_ORDERS,
  async (
    payload: {
      recommendSubOrders: {
        planId: string;
        orderId: string;
        subOrderDate: string;
      }[];
      recommendFrom: 'orderList' | 'orderDetail';
    },
    { getState, extra: sdk, dispatch },
  ) => {
    const { recommendFrom, recommendSubOrders } = payload;
    const { orders: orderListOrders, allPlans: orderListAllPlans } =
      getState().ParticipantOrderList;
    const { order: detailOrderOrder, plans: detailOrderPlans } =
      getState().ParticipantOrderManagementPage;
    const orders =
      recommendFrom === 'orderList' ? orderListOrders : [detailOrderOrder];
    const allPlans =
      recommendFrom === 'orderList' ? orderListAllPlans : detailOrderPlans;
    const { currentUser } = getState().user;
    const currentUserGetter = CurrentUser(currentUser!);
    const { allergies = [] } = currentUserGetter.getPublicData();

    const foodIdChunkList = recommendSubOrders.map(
      (item) =>
        getFoodIdListWithSuitablePrice({
          payload: item,
          orders,
          allPlans,
        }) || [],
    );

    const flattenFoodIdList = uniq(flatten(foodIdChunkList));
    const slicedFoodIdsBy100 = chunk(flattenFoodIdList, 100);
    const foodQueries = slicedFoodIdsBy100.map((foodIds) =>
      getFoodQuery({
        foodIds,
        params: {},
      }),
    );

    const foodsResponse: TListing[] = flatten(
      await Promise.all(
        foodQueries.map(async (foodQuery) => {
          const response = denormalisedResponseEntities(
            await sdk.listings.query(foodQuery),
          );

          return response;
        }),
      ),
    );

    const groupedFoodBySubOrderDate = recommendSubOrders.reduce(
      (result: any, item, index: number) => {
        const subOrderFoodIds = foodIdChunkList[index];
        const mostSuitableFood = recommendFood({
          foodList: foodsResponse,
          subOrderFoodIds,
          allergies,
        });

        return {
          ...result,
          [item.planId]: {
            ...result[item.planId],
            [item.subOrderDate]: mostSuitableFood,
          },
        };
      },
      {},
    );

    const mappedRecommendFoodToOrderDetail = Object.keys(
      groupedFoodBySubOrderDate,
    ).reduce((result: any, planId) => {
      const newOrderDetail = updateRecommendFoodToOrderDetail({
        allPlans,
        planId,
        currentUserGetter,
        groupedFood: groupedFoodBySubOrderDate,
      });

      return {
        ...result,
        [planId]: {
          orderDetail: newOrderDetail,
        },
      };
    }, {});

    await recommendFoodForSubOrdersApi({ mappedRecommendFoodToOrderDetail });
    recommendSubOrders.forEach((item) => {
      const { planId, subOrderDate } = item;
      participantSubOrderAddDocumentApi({
        participantId: currentUserGetter.getId(),
        planId,
        timestamp: +subOrderDate,
      });
    });

    const newAllPlans = allPlans.map((plan: TListing) => {
      if (
        Object.keys(mappedRecommendFoodToOrderDetail).includes(plan.id.uuid)
      ) {
        return {
          ...plan,
          attributes: {
            ...plan.attributes,
            metadata: {
              ...plan.attributes.metadata,
              orderDetail:
                mappedRecommendFoodToOrderDetail[plan.id.uuid].orderDetail,
            },
          },
        };
      }

      return plan;
    });

    if (recommendFrom === 'orderList') {
      return newAllPlans;
    }

    dispatch(ParticipantOrderManagementActions.updatePlans(newAllPlans));

    return orderListAllPlans;
  },
);

const pickFoodForSpecificSubOrder = createAsyncThunk(
  PICK_FOOD_FOR_SPECIFIC_SUB_ORDER,
  async (
    payload: {
      recommendSubOrder: {
        planId: string;
        orderId: string;
        subOrderDate: string;
      };
      recommendFrom: 'orderList' | 'orderDetail';
    },
    { getState, extra: sdk, dispatch },
  ) => {
    const { recommendFrom, recommendSubOrder } = payload;
    const { planId, subOrderDate } = recommendSubOrder;
    const { orders: orderListOrders, allPlans: orderListAllPlans } =
      getState().ParticipantOrderList;
    const { order: detailOrderOrder, plans: detailOrderPlans } =
      getState().ParticipantOrderManagementPage;
    const orders =
      recommendFrom === 'orderList' ? orderListOrders : [detailOrderOrder];
    const allPlans =
      recommendFrom === 'orderList' ? orderListAllPlans : detailOrderPlans;
    const { currentUser } = getState().user;
    const currentUserGetter = CurrentUser(currentUser!);
    const { allergies = [] } = currentUserGetter.getPublicData();

    const foodIdList = getFoodIdListWithSuitablePrice({
      payload: recommendSubOrder,
      orders,
      allPlans,
    });

    const flattenFoodIdList = uniq<string>(foodIdList);
    const slicedFoodIdsBy100 = chunk(flattenFoodIdList, 100);
    const foodQueries = slicedFoodIdsBy100.map((foodIds) =>
      getFoodQuery({
        foodIds,
        params: {},
      }),
    );

    const foodsResponse: TListing[] = flatten(
      await Promise.all(
        foodQueries.map(async (foodQuery) => {
          const response = denormalisedResponseEntities(
            await sdk.listings.query(foodQuery),
          );

          return response;
        }),
      ),
    );

    const mostSuitableFood = recommendFood({
      foodList: foodsResponse,
      subOrderFoodIds: foodIdList,
      allergies,
    });

    const groupedFood = {
      [planId]: {
        [subOrderDate]: mostSuitableFood,
      },
    };

    const newOrderDetail = updateRecommendFoodToOrderDetail({
      allPlans,
      planId,
      currentUserGetter,
      groupedFood,
    });

    await recommendFoodForSubOrdersApi({
      mappedRecommendFoodToOrderDetail: {
        [planId]: {
          orderDetail: newOrderDetail,
        },
      },
    });

    participantSubOrderAddDocumentApi({
      participantId: currentUserGetter.getId(),
      planId,
      timestamp: +subOrderDate,
    });

    const newAllPlans = allPlans.map((plan: TListing) => {
      if (plan.id.uuid === planId) {
        return {
          ...plan,
          attributes: {
            ...plan.attributes,
            metadata: {
              ...plan.attributes.metadata,
              orderDetail: newOrderDetail,
            },
          },
        };
      }

      return plan;
    });

    if (recommendFrom === 'orderList') {
      return newAllPlans;
    }

    dispatch(ParticipantOrderManagementActions.updatePlans(newAllPlans));

    return orderListAllPlans;
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
  pickFoodForSubOrders,
  pickFoodForSpecificSubOrder,
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
    updatePlanDetail: (state, action) => {
      const { payload: plan } = action;
      const newAllPlans = state.allPlans.map((oldPlan: any) => {
        if (oldPlan.id.uuid === plan.id.uuid) {
          return plan;
        }

        return oldPlan;
      });

      return {
        ...state,
        allPlans: newAllPlans,
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
        state.company = payload.company;
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
      )

      .addCase(pickFoodForSubOrders.pending, (state) => {
        state.pickFoodForSubOrdersInProgress = true;
        state.pickFoodForSubOrdersError = false;
      })
      .addCase(pickFoodForSubOrders.fulfilled, (state, { payload }) => {
        state.pickFoodForSubOrdersInProgress = false;
        state.allPlans = payload;
      })
      .addCase(pickFoodForSubOrders.rejected, (state, { error }) => {
        state.pickFoodForSubOrdersInProgress = false;
        state.pickFoodForSubOrdersError = error.message;
      })

      .addCase(pickFoodForSpecificSubOrder.pending, (state) => {
        state.pickFoodForSpecificSubOrderInProgress = true;
        state.pickFoodForSpecificSubOrderError = false;
      })
      .addCase(pickFoodForSpecificSubOrder.fulfilled, (state, { payload }) => {
        state.pickFoodForSpecificSubOrderInProgress = false;
        state.allPlans = payload;
      })
      .addCase(pickFoodForSpecificSubOrder.rejected, (state, { error }) => {
        state.pickFoodForSpecificSubOrderInProgress = false;
        state.pickFoodForSpecificSubOrderError = error.message;
      });
  },
});

// ================ Actions ================ //
export const OrderListActions = OrderListSlice.actions;
export default OrderListSlice.reducer;

// ================ Selectors ================ //
