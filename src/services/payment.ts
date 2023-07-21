import { EPaymentStatus } from '@src/utils/enums';

import {
  addCollectionDoc,
  deleteDocument,
  getDocumentById,
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
  subOrderDate?: number;
  companyName?: string;
  orderTitle?: string;
};

export const createPaymentRecordOnFirebase = async (
  type: 'client' | 'partner',
  params: Partial<PaymentBaseParams>,
) => {
  const paymentCreatedAt = new Date();
  try {
    switch (type) {
      case 'partner': {
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
      }

      default:
        break;
    }
  } catch (error) {
    console.error('Error payment record type: ', type);
    console.error('Error creating payment record: ', error);
  }
};

export const queryPaymentRecordOnFirebase = async (query: any) => {
  try {
    const { paymentType, partnerId, orderId, subOrderDate } = query;
    const isPartnerPaymentRecordQuery = paymentType === 'partner';
    const partnerQuery = isPartnerPaymentRecordQuery && {
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
        ...(isPartnerPaymentRecordQuery ? partnerQuery : {}),
      },
    });

    return paymentRecords;
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
