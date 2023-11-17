import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';

import { generateUncountableIdForOrder } from '@helpers/generateUncountableId';
import { getInitMemberOrder } from '@pages/api/orders/[orderId]/plan/memberOrder.helper';
import { createOrUpdateAutomaticStartOrderScheduler } from '@services/awsEventBrigdeScheduler';
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
  getDayOfWeek,
  getDaySessionFromDeliveryTime,
  renderDateRange,
} from '@src/utils/dates';
import {
  EBookerOrderDraftStates,
  EListingStates,
  EOrderDraftStates,
  EOrderType,
} from '@src/utils/enums';
import type {
  TObject,
  TOrderChangeHistoryItem,
  TSubOrderChangeHistoryItem,
} from '@src/utils/types';

const FIREBASE_SUB_ORDER_CHANGES_HISTORY_COLLECTION_NAME =
  process.env.FIREBASE_SUB_ORDER_CHANGES_HISTORY_COLLECTION_NAME || '';
const FIREBASE_ORDER_CHANGES_HISTORY_COLLECTION_NAME =
  process.env.FIREBASE_ORDER_CHANGES_HISTORY_COLLECTION_NAME || '';

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

const normalizeOrderMetadata = (metadata: TObject = {}) => {
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
  } = metadata;

  const ensuredDeliveryHour = isEmpty(deliveryHour)
    ? undefined
    : deliveryHour.includes('-')
    ? deliveryHour.split('-')[0]
    : deliveryHour;

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
    deliveryHour,
    daySession:
      daySession || getDaySessionFromDeliveryTime(ensuredDeliveryHour),
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

const reorder = async ({
  orderIdToReOrder,
  bookerId,
  isCreatedByAdmin,
  dateParams,
}: {
  orderIdToReOrder: string;
  bookerId: string;
  isCreatedByAdmin?: boolean;
  dateParams: {
    startDate: number;
    endDate: number;
    deadlineDate: number;
    deadlineHour: number;
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
  } = Listing(oldOrder).getMetadata();
  const { startDate, endDate, deadlineDate, deadlineHour } = dateParams;

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
  const oldMetaData = Listing(oldOrder).getMetadata();

  const newOrderResponse = await integrationSdk.listings.create({
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
      ...normalizeOrderMetadata(oldMetaData),
      startDate,
      endDate,
      deadlineDate,
      deadlineHour,
    },
  });

  const orderDatesInTimestamp = renderDateRange(startDate, endDate);
  const orderDatesWeekdayList = generateWeekDayList(startDate, endDate);

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

      const { orderDetail = {} } = Listing(oldPlan).getMetadata();
      const updatedOrderDetail = Object.keys(orderDetail).reduce(
        (result, date) => {
          const subOrderNeededData = omit(orderDetail[date], [
            'isPaid',
            'lastTransition',
            'transactionId',
          ]);
          const weekDayOfOldDate = getDayOfWeek(+date);
          const newDate =
            orderDatesInTimestamp[
              orderDatesWeekdayList.indexOf(weekDayOfOldDate)
            ];

          if (!newDate) {
            return result;
          }

          return {
            ...result,
            [`${newDate}`]: {
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
      const newPlanResponse = await integrationSdk.listings.create({
        title: `${generatedOrderTitle} - Plan week ${index + 1}`,
        authorId: subAccountId,
        state: EListingStates.published,
        metadata: {
          ...Listing(oldPlan).getMetadata(),
          viewed: false,
          orderId: Listing(newOrder).getId(),
          orderDetail: updatedOrderDetail,
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

  const { deliveryHour } = oldMetaData;
  if (isGroupOrder && !isCreatedByAdmin && newOrderId) {
    createOrUpdateAutomaticStartOrderScheduler({
      orderId,
      startDate,
      deliveryHour,
    });
  }

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
