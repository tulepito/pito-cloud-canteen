import {
  addCollectionDoc,
  getCollectionCount,
  queryCollectionData,
} from '@services/firebase';
import type {
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

const orderServices = {
  createOrderHistoryRecordToFirestore,
  createSubOrderHistoryRecordToFirestore,
  querySubOrderHistoryFromFirebase,
  getSubOrderHistoryCount,
};

export default orderServices;
