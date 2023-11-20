import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';
import { DateTime } from 'luxon';

import type { TDaySession } from '@components/CalendarDashboard/helpers/types';
import { queryAllPages } from '@helpers/apiHelpers';
import { generateUncountableIdForOrder } from '@helpers/generateUncountableId';
import { getMenuQueryInSpecificDay } from '@helpers/listingSearchQuery';
import { isOrderDetailDatePickedFood } from '@helpers/orderHelper';
import { getInitMemberOrder } from '@pages/api/orders/[orderId]/plan/memberOrder.helper';
import { recommendRestaurants } from '@pages/api/orders/[orderId]/restaurants-recommendation/recommendRestaurants.service';
import { denormalisedResponseEntities } from '@services/data';
import {
  addCollectionDoc,
  getCollectionCount,
  queryCollectionData,
} from '@services/firebase';
import { getOrderNumber, updateOrderNumber } from '@services/getAdminAccount';
import { fetchUser } from '@services/integrationHelper';
import { getIntegrationSdk } from '@services/sdk';
import { Listing, User } from '@src/utils/data';
import {
  formatTimestamp,
  generateWeekDayList,
  getDaySessionFromDeliveryTime,
  renderDateRange,
} from '@src/utils/dates';
import {
  EBookerOrderDraftStates,
  EInvalidRestaurantCase,
  EListingStates,
  EOrderDraftStates,
  EOrderType,
  ERestaurantListingStatus,
} from '@src/utils/enums';
import { INITIAL_DELIVERY_TIME_BASE_ON_DAY_SESSION } from '@src/utils/options';
import type {
  TListing,
  TObject,
  TOrderChangeHistoryItem,
  TSubOrderChangeHistoryItem,
} from '@src/utils/types';

const FIREBASE_SUB_ORDER_CHANGES_HISTORY_COLLECTION_NAME =
  process.env.FIREBASE_SUB_ORDER_CHANGES_HISTORY_COLLECTION_NAME || '';
const FIREBASE_ORDER_CHANGES_HISTORY_COLLECTION_NAME =
  process.env.FIREBASE_ORDER_CHANGES_HISTORY_COLLECTION_NAME || '';

const ORDER_DETAIL_KEYS_TO_REMOVE = [
  'isPaid',
  'lastTransition',
  'transactionId',
];

const createSubOrderHistoryRecordToFirestore = async (
  createData: TSubOrderChangeHistoryItem,
) => {
  const data = await addCollectionDoc(
    createData,
    FIREBASE_SUB_ORDER_CHANGES_HISTORY_COLLECTION_NAME,
  );

  return data;
};

const createOrderHistoryRecordToFirestore = async (
  createData: TOrderChangeHistoryItem,
) => {
  const data = await addCollectionDoc(
    createData,
    FIREBASE_ORDER_CHANGES_HISTORY_COLLECTION_NAME,
  );

  return data;
};

const normalizeOrderMetadata = (metadata: TObject, newData: TObject) => {
  const {
    companyId,
    vatSettings = {},
    serviceFees = {},
    listingType,
    dayInWeek,
    deliveryAddress,
    detailAddress,
    displayedDurationTime,
    durationTimeMode,
    memberAmount,
    notes,
    nutritions,
    orderType,
    orderVATPercentage,
    packagePerMember,
    participants,
    pickAllow,
    selectedGroups,
    shipperName,
    staffName,
    vatAllow,
    deliveryHour,
    daySession,
    mealType,
    deadlineHour,
  } = metadata || {};
  const { daySession: newDaySession } = newData || {};

  const oldDaySession =
    daySession ||
    getDaySessionFromDeliveryTime(
      isEmpty(deliveryHour)
        ? undefined
        : deliveryHour.includes('-')
        ? deliveryHour.split('-')[0]
        : deliveryHour,
    );
  const newDeliveryHour =
    newDaySession === oldDaySession
      ? deliveryHour
      : INITIAL_DELIVERY_TIME_BASE_ON_DAY_SESSION[newDaySession as TDaySession];

  const newOrderMetadata = {
    companyId,
    vatSettings,
    serviceFees,
    listingType,
    dayInWeek,
    deliveryAddress,
    detailAddress,
    displayedDurationTime,
    durationTimeMode,
    memberAmount,
    notes,
    nutritions,
    orderType,
    orderVATPercentage,
    packagePerMember,
    participants,
    pickAllow,
    selectedGroups,
    shipperName,
    staffName,
    vatAllow,
    deliveryHour: newDeliveryHour,
    daySession: newDaySession,
    deadlineHour,
    mealType,
  };

  return newOrderMetadata;
};

const querySubOrderHistoryFromFirebase = async ({
  planId,
  planOrderDate,
  limitRecords,
  lastRecord,
}: {
  planId: string;
  planOrderDate: number;
  limitRecords?: number;
  lastRecord?: number;
}) => {
  const queryParams = {
    planId: {
      operator: '==',
      value: planId,
    },
    planOrderDate: {
      operator: '==',
      value: planOrderDate,
    },
  };

  const results = await queryCollectionData({
    collectionName: FIREBASE_SUB_ORDER_CHANGES_HISTORY_COLLECTION_NAME,
    queryParams,
    limitRecords,
    lastRecord,
  });

  return results as TSubOrderChangeHistoryItem[];
};

const getSubOrderHistoryCount = async ({
  planId,
  planOrderDate,
}: {
  planId: string;
  planOrderDate: number;
}) => {
  const queryParams = {
    planId: {
      operator: '==',
      value: planId,
    },
    planOrderDate: {
      operator: '==',
      value: planOrderDate,
    },
  };
  const result = await getCollectionCount({
    collectionName: FIREBASE_SUB_ORDER_CHANGES_HISTORY_COLLECTION_NAME,
    queryParams,
  });

  return result as number;
};

const checkRestaurantAvailableStatus = async ({
  order,
  orderDetail,
}: {
  order: TListing;
  orderDetail: TObject;
}) => {
  const integrationSdk = getIntegrationSdk();

  const availableOrderDetailCheckList = await Promise.all(
    Object.keys(orderDetail).map(async (timestamp) => {
      const { restaurant } = orderDetail[timestamp];
      const { menuId, id: restaurantId } = restaurant;
      const [restaurantListing] = denormalisedResponseEntities(
        (await integrationSdk.listings.show({ id: restaurantId })) || [{}],
      );

      const { status = ERestaurantListingStatus.authorized } =
        Listing(restaurantListing).getMetadata();
      const {
        stopReceiveOrder = false,
        startStopReceiveOrderDate = 0,
        endStopReceiveOrderDate = 0,
      } = Listing(restaurantListing).getPublicData();
      const isInStopReceiveOrderTime =
        stopReceiveOrder &&
        Number(timestamp) >= startStopReceiveOrderDate &&
        Number(timestamp) <= endStopReceiveOrderDate;
      if (isInStopReceiveOrderTime) {
        return {
          [timestamp]: {
            isAvailable: false,
            status: EInvalidRestaurantCase.stopReceiveOrder,
          },
        };
      }
      if (status !== ERestaurantListingStatus.authorized) {
        return {
          [timestamp]: {
            isAvailable: false,
            status: EInvalidRestaurantCase.closed,
          },
        };
      }
      const menuQuery = getMenuQueryInSpecificDay({
        order,
        timestamp: +timestamp,
      });
      const allMenus = await queryAllPages({
        sdkModel: integrationSdk.listings,
        query: menuQuery,
      });

      const isAnyMenusValid =
        allMenus.findIndex((menu: TListing) => menu.id.uuid === menuId) !== -1;

      return {
        [timestamp]: {
          isAvailable: isAnyMenusValid,
          ...(isAnyMenusValid
            ? { status: EInvalidRestaurantCase.noMenusValid }
            : {}),
        },
      };
    }),
  );

  return availableOrderDetailCheckList.reduce(
    (result, item) => ({
      ...result,
      ...item,
    }),
    {},
  );
};

const reorder = async ({
  orderIdToReOrder,
  bookerId,
  isCreatedByAdmin,
  params,
}: {
  orderIdToReOrder: string;
  bookerId: string;
  isCreatedByAdmin?: boolean;
  params: {
    startDate: number;
    endDate: number;
    daySession?: TDaySession;
  };
}) => {
  const integrationSdk = getIntegrationSdk();
  const response = await integrationSdk.listings.show({
    id: orderIdToReOrder,
  });
  const [oldOrder] = denormalisedResponseEntities(response);
  const {
    companyId,
    plans: oldPlans = [],
    orderType,
    selectedGroups = [],
    startDate: oldStartDate,
    endDate: oldEndDate,
  } = Listing(oldOrder).getMetadata();
  const { startDate, endDate, daySession } = params;

  const companyAccount = await fetchUser(companyId);
  const currentOrderNumber = await getOrderNumber();
  const { subAccountId } = User(companyAccount).getPrivateData();
  const { companyName } = User(companyAccount).getPublicData();

  const orderId = generateUncountableIdForOrder(currentOrderNumber);
  const generatedOrderTitle = `PT${orderId}`;

  // Prepare order state history
  const orderState = isCreatedByAdmin
    ? EOrderDraftStates.draft
    : EBookerOrderDraftStates.bookerDraft;

  const orderStateHistory = [
    {
      state: orderState,
      updatedAt: new Date().getTime(),
    },
  ];

  const newOrderResponse = await integrationSdk.listings.create(
    {
      authorId: subAccountId,
      title: generatedOrderTitle,
      state: EListingStates.published,
      publicData: {
        companyName,
        orderName: `${companyName}_${formatTimestamp(
          startDate,
        )} - ${formatTimestamp(endDate)}`,
      },
      metadata: {
        bookerId,
        orderStateHistory,
        orderState,
        companyName,
        ...normalizeOrderMetadata(Listing(oldOrder).getMetadata(), {
          daySession,
        }),
        startDate,
        endDate,
        deadlineDate: DateTime.fromMillis(startDate)
          .setZone('Asia/Ho_Chi_Minh')
          .minus({ day: 2 })
          .toMillis(),
      },
    },
    { expand: true },
  );

  // * new order date list info
  const orderDatesInTimestamp = renderDateRange(startDate, endDate);
  const orderDatesWeekdayList = generateWeekDayList(startDate, endDate);
  // * old order date list info
  const oldOrderDatesInTimestamp = renderDateRange(oldStartDate, oldEndDate);
  const oldOrderDatesWeekdayList = generateWeekDayList(
    oldStartDate,
    oldEndDate,
  );
  const [newOrder] = denormalisedResponseEntities(newOrderResponse);
  const newOrderId = Listing(newOrder).getId();
  const isGroupOrder = orderType === EOrderType.group;
  const initialMemberOrder = getInitMemberOrder({
    companyAccount,
    selectedGroups,
  });
  const plans = await Promise.all(
    oldPlans.map(async (id: string, index: number) => {
      const [oldPlan] = denormalisedResponseEntities(
        await integrationSdk.listings.show({ id }),
      );

      const { orderDetail: oldOrderDetail = {} } =
        Listing(oldPlan).getMetadata();

      // * find has restaurant & food from old order detail
      const hasRestaurantDateListFormOldPlan = Object.keys(
        oldOrderDetail,
      ).filter((date) => isOrderDetailDatePickedFood(oldOrderDetail[date]));
      const hasRestaurantDatesCount = hasRestaurantDateListFormOldPlan.length;

      let newOrderDetail = orderDatesInTimestamp.reduce(
        (result, currentDate, dateIdx) => {
          const weekDayOfDate = orderDatesWeekdayList[dateIdx];
          let dateToCopy: string | number =
            oldOrderDatesInTimestamp[
              oldOrderDatesWeekdayList.indexOf(weekDayOfDate)
            ];

          // * if week day not include in old week day list or empty order detail on date
          if (!dateToCopy || isEmpty(oldOrderDetail[dateToCopy])) {
            if (hasRestaurantDatesCount === 0) {
              return result;
            }

            dateToCopy =
              hasRestaurantDateListFormOldPlan[
                Math.floor(Math.random() * (hasRestaurantDatesCount - 1))
              ];
          }

          // * remove unnecessary info from old order detail on date
          const subOrderNeededData: TObject = omit(
            oldOrderDetail[dateToCopy],
            ORDER_DETAIL_KEYS_TO_REMOVE,
          );

          return {
            ...result,
            [`${currentDate}`]: {
              ...subOrderNeededData,
              memberOrders: isGroupOrder ? {} : initialMemberOrder,
              restaurant: {
                ...subOrderNeededData.restaurant,
                foodList: {},
              },
            },
          };
        },
        {},
      );
      // * check available status
      const restaurantAvailableMap = await checkRestaurantAvailableStatus({
        order: newOrder,
        orderDetail: newOrderDetail,
      });
      const isAllDateUnAvailable = Object.keys(restaurantAvailableMap).every(
        (item) => !restaurantAvailableMap[item].isAvailable,
      );
      if (isAllDateUnAvailable) {
        newOrderDetail = await recommendRestaurants({
          orderId: newOrderId,
          shouldCalculateDistance: true,
        });
      }

      const newPlanResponse = await integrationSdk.listings.create({
        title: `${generatedOrderTitle} - Plan week ${index + 1}`,
        authorId: subAccountId,
        state: EListingStates.published,
        metadata: {
          ...Listing(oldPlan).getMetadata(),
          viewed: false,
          orderId: newOrderId,
          orderDetail: newOrderDetail,
        },
      });
      const [newPlan] = denormalisedResponseEntities(newPlanResponse);

      return Listing(newPlan).getId();
    }),
  );

  const updatedOrder = await integrationSdk.listings.update(
    {
      id: newOrderId,
      metadata: {
        plans,
      },
    },
    { expand: true },
  );

  updateOrderNumber();

  return denormalisedResponseEntities(updatedOrder)[0];
};

const orderServices = {
  createOrderHistoryRecordToFirestore,
  createSubOrderHistoryRecordToFirestore,
  querySubOrderHistoryFromFirebase,
  getSubOrderHistoryCount,
  reorder,
};

export default orderServices;
