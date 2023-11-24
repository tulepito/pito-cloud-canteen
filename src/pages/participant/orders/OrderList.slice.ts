import { createSlice } from '@reduxjs/toolkit';
import { intersection, maxBy, random } from 'lodash';
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
  fetchOrdersApi,
  participantPostRatingApi,
  recommendFoodForSubOrdersApi,
} from '@apis/participantApi';
import { disableWalkthroughApi } from '@apis/userApi';
import { getFoodQuery } from '@helpers/listingSearchQuery';
import { markColorForOrder } from '@helpers/orderHelper';
import { createAsyncThunk } from '@redux/redux.helper';
import { ParticipantOrderManagementActions } from '@redux/slices/ParticipantOrderManagementPage.slice';
import { userThunks } from '@redux/slices/user.slice';
import {
  CurrentUser,
  denormalisedResponseEntities,
  Listing,
} from '@src/utils/data';
import { EParticipantOrderStatus, ESubOrderTxStatus } from '@src/utils/enums';
import { convertStringToNumber } from '@src/utils/number';
import { ALLERGIES_OPTIONS, getLabelByKey } from '@src/utils/options';
import { toNonAccentVietnamese } from '@src/utils/string';
import type { TListing, TObject, TTransaction, TUser } from '@src/utils/types';

import { SubOrdersThunks } from '../sub-orders/SubOrders.slice';

// ================ Initial states ================ //
type TOrderListState = {
  updateProfileInProgress: boolean;
  updateProfileError: any;

  walkthroughCurrentStep: number;
  disableWalkthroughInProgress: boolean;
  disableWalkthroughError: any;

  foodsInPlans: any[];
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
  updateProfileInProgress: false,
  updateProfileError: null,

  walkthroughCurrentStep: 0,
  disableWalkthroughInProgress: false,
  disableWalkthroughError: null,

  foodsInPlans: [],
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
      const { foodPrice = 0 } = foodList[foodId] || {};
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
      intersection(
        Listing(food)
          .getPublicData()
          .allergicIngredients?.map((_foodAllergy: string) =>
            toNonAccentVietnamese(_foodAllergy),
          ),
        allergies.map((allergy: string) =>
          toNonAccentVietnamese(getLabelByKey(ALLERGIES_OPTIONS, allergy)),
        ),
      ).length === 0,
  );
  const isAllFoodHaveAllergies = filteredFoodListByAllergies.length === 0;

  const foodListToFilter = isAllFoodHaveAllergies
    ? subOrderFoodList
    : filteredFoodListByAllergies;

  const isAllFoodHaveNoRating = foodListToFilter.every(
    (food) => !Listing(food).getMetadata().rating,
  );

  const randomFood =
    foodListToFilter[Math.floor(Math.random() * foodListToFilter.length)];

  const mostSuitableFood = !isAllFoodHaveNoRating
    ? maxBy(
        foodListToFilter,
        (food) => Listing(food).getMetadata()?.rating || 0,
      )
    : maxBy(
        foodListToFilter,
        (food) => Listing(food).getMetadata()?.pickingTime || 0,
      );

  return random() === 1 ? randomFood : mostSuitableFood;
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
const DISABLE_WALKTHROUGH = 'app/ParticipantOrderList/DISABLE_WALKTHROUGH';
const FETCH_ORDERS = 'app/ParticipantOrderList/FETCH_ORDERS';
const UPDATE_SUB_ORDER = 'app/ParticipantOrderList/UPDATE_SUB_ORDER';

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

const disableWalkthrough = createAsyncThunk(
  DISABLE_WALKTHROUGH,
  async (userId: string, { dispatch }) => {
    await disableWalkthroughApi(userId);
    await dispatch(userThunks.fetchCurrentUser());
  },
);

const fetchOrders = createAsyncThunk(
  FETCH_ORDERS,
  async ({ startDate, endDate }: TObject) => {
    const { data } = await fetchOrdersApi({
      startDate,
      endDate,
    });

    const {
      orders,
      allPlans,
      restaurants,
      mappingSubOrderToOrder,
      company,
      foodsInPlans,
    } = data;

    return {
      orders,
      allPlans,
      restaurants,
      mappingSubOrderToOrder,
      company,
      foodsInPlans,
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
  disableWalkthrough,
  fetchOrders,
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

        state.restaurants = payload.restaurants;
        state.allPlans = uniqBy(
          [...payload.allPlans, ...state.allPlans],
          'id.uuid',
        );
        state.mappingSubOrderToOrder = {
          ...state.mappingSubOrderToOrder,
          ...payload.mappingSubOrderToOrder,
        };
        state.company = payload.company;
        state.foodsInPlans = payload.foodsInPlans;
      })
      .addCase(fetchOrders.rejected, (state, { error }) => {
        state.fetchOrdersInProgress = false;
        state.fetchOrdersError = error.message;
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
