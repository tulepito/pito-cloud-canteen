import { generateUncountableIdForOrder } from '@helpers/generateUncountableId';
import { getInitMemberOrder } from '@pages/api/orders/[orderId]/plan/memberOrder.helper';
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
  EBookerOrderDraftStates,
  EListingStates,
  EOrderDraftStates,
  EOrderType,
} from '@src/utils/enums';
import type { TObject, TSubOrderChangeHistoryItem } from '@src/utils/types';

const FIREBASE_SUB_ORDER_CHANGES_HISTORY_COLLECTION_NAME =
  process.env.FIREBASE_SUB_ORDER_CHANGES_HISTORY_COLLECTION_NAME || '';

const createSubOrderHistoryRecordToFirestore = async (
  createData: TSubOrderChangeHistoryItem,
) => {
  const data = await addCollectionDoc(
    createData,
    FIREBASE_SUB_ORDER_CHANGES_HISTORY_COLLECTION_NAME,
  );

  return data;
};

const normalizeOrderMetadata = (metadata: TObject = {}) => {
  const newOrderMetadata = {
    ...metadata,
  };

  delete newOrderMetadata?.startDate;
  delete newOrderMetadata?.endDate;
  delete newOrderMetadata?.deadlineHour;
  delete newOrderMetadata?.deliveryHour;
  delete newOrderMetadata?.plans;
  delete newOrderMetadata?.quotationId;

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

const reorder = async (
  orderIdToReOrder: string,
  bookerId: string,
  isCreatedByAdmin?: boolean,
) => {
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

  const newOrderResponse = await integrationSdk.listings.create({
    authorId: subAccountId,
    title: generatedOrderTitle,
    state: EListingStates.published,
    metadata: normalizeOrderMetadata({
      ...Listing(oldOrder).getMetadata(),
      bookerId,
      orderStateHistory,
      orderState,
      companyName,
    }),
  });

  const [newOrder] = denormalisedResponseEntities(newOrderResponse);
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
          return {
            ...result,
            [date]: {
              ...orderDetail[date],
              memberOrders: isGroupOrder ? {} : initialMemberOrder,
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

  const updatedOrder = await integrationSdk.listings.update({
    id: Listing(newOrder).getId(),
    metadata: {
      plans,
    },
  });

  updateOrderNumber();

  return denormalisedResponseEntities(updatedOrder)[0];
};

const orderServices = {
  createSubOrderHistoryRecordToFirestore,
  querySubOrderHistoryFromFirebase,
  getSubOrderHistoryCount,
  reorder,
};

export default orderServices;
