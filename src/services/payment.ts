import { EPaymentStatus, EPaymentType } from '@src/utils/enums';
import type { TObject } from '@src/utils/types';

import {
  addCollectionDoc,
  deleteDocument,
  getCollectionCount,
  getDocumentById,
  queryAllCollectionData,
  queryCollectionData,
} from './firebase';

const { FIREBASE_PAYMENT_RECORD_COLLECTION_NAME } = process.env;

export type PaymentBaseParams = {
  SKU: string;
  amount: number;
  paymentNote: string;
  paymentStatus: EPaymentStatus;
  orderId: string;
  partnerId?: string;
  partnerName?: string;
  subOrderDate?: string;
  startDate?: number;
  endDate?: number;
  companyName?: string;
  orderTitle?: string;
  totalPrice?: number;
  deliveryHour?: string;
  isHideFromHistory?: boolean;
  company?: TObject;
  restaurants?: TObject[];
};

export const createPaymentRecordOnFirebase = async (
  type: EPaymentType,
  params: Partial<PaymentBaseParams>,
) => {
  const paymentCreatedAt = new Date();
  try {
    const data = {
      ...params,
      paymentType: type,
      paymentStatus: EPaymentStatus.SUCCESS,
      createdAt: paymentCreatedAt,
    };
    const paymentRecordId = await addCollectionDoc(
      data,
      FIREBASE_PAYMENT_RECORD_COLLECTION_NAME!,
    );
    const paymentRecordData = await getDocumentById(
      paymentRecordId,
      FIREBASE_PAYMENT_RECORD_COLLECTION_NAME!,
    );

    return {
      id: paymentRecordId,
      ...paymentRecordData,
    };
  } catch (error) {
    console.error('Error payment record type: ', type);
    console.error('Error creating payment record: ', error);
  }
};

export const queryPaymentRecordOnFirebase = async (query: any) => {
  try {
    const { paymentType, partnerId, orderId, subOrderDate } = query;
    const paymentQuery = {
      ...(partnerId && {
        partnerId: {
          operator: '==',
          value: partnerId,
        },
      }),
      orderId: {
        operator: '==',
        value: orderId,
      },
      ...(subOrderDate && {
        subOrderDate: {
          operator: '==',
          value: subOrderDate,
        },
      }),
    };
    const paymentRecords = await queryCollectionData({
      collectionName: FIREBASE_PAYMENT_RECORD_COLLECTION_NAME!,
      queryParams: {
        paymentType: {
          operator: '==',
          value: paymentType,
        },
        ...paymentQuery,
      },
    });

    return paymentRecords;
  } catch (error) {
    console.error('Error query payment record: ', error);
  }
};

export const queryAllPartnerPaymentRecordsOnFirebase = async (query = {}) => {
  try {
    const { partnerId } = query as TObject;
    const paymentRecords = await queryAllCollectionData({
      collectionName: FIREBASE_PAYMENT_RECORD_COLLECTION_NAME!,
      queryParams: {
        paymentType: {
          operator: '==',
          value: EPaymentType.PARTNER,
        },
        ...(partnerId && {
          partnerId: {
            operator: '==',
            value: partnerId,
          },
        }),
      },
    });

    return paymentRecords;
  } catch (error) {
    console.error('Error query payment record: ', error);
  }
};

export const queryAllCompanyPaymentRecordsOnFirebase = async (query = {}) => {
  const { companyId } = query as TObject;

  return queryAllCollectionData({
    collectionName: FIREBASE_PAYMENT_RECORD_COLLECTION_NAME!,
    queryParams: {
      paymentType: {
        operator: '==',
        value: 'client',
      },
      ...(companyId && {
        partnerId: {
          operator: '==',
          value: companyId,
        },
      }),
    },
  });
};

export const getTotalRecordsOnFirebase = async (query: any) => {
  try {
    const totalRecords = await getCollectionCount({
      collectionName: FIREBASE_PAYMENT_RECORD_COLLECTION_NAME!,
      queryParams: query,
    });

    return totalRecords as number;
  } catch (error) {
    console.error('Error query payment record: ', error);
  }
};

export const deletePaymentRecordByIdOnFirebase = async (
  paymentRecordId: string,
) => {
  try {
    await deleteDocument(
      paymentRecordId,
      FIREBASE_PAYMENT_RECORD_COLLECTION_NAME!,
    );
  } catch (error) {
    console.error('Error delete payment record: ', error);
  }
};
