import {
  queryPaymentRecordOnFirebase,
  updatePaymentRecordOnFirebase,
} from '@services/payment';
import { EPaymentType } from '@src/utils/enums';
import type { TObject } from '@src/utils/types';

export const updatePartnerRootPaymentRecord = async ({
  subOrderDate,
  orderId,
  updateData,
}: TObject) => {
  const partnerPaymentRecords =
    (await queryPaymentRecordOnFirebase({
      paymentType: EPaymentType.PARTNER,
      subOrderDate,
      orderId,
      isHideFromHistory: true,
    })) || [];

  if (partnerPaymentRecords?.length === 0) {
    console.error('Error update partner root payment record: ');
    console.error({
      subOrderDate,
      orderId,
      updateData,
    });

    return null;
  }
  const record = partnerPaymentRecords[0];
  const recordId = record.id;

  if (recordId) {
    await updatePaymentRecordOnFirebase(recordId, updateData);
  }
};

export const updateClientRootPaymentRecord = async ({
  orderId,
  updateData,
}: TObject) => {
  const partnerPaymentRecords =
    (await queryPaymentRecordOnFirebase({
      paymentType: EPaymentType.CLIENT,
      orderId,
      isHideFromHistory: true,
    })) || [];

  if (partnerPaymentRecords?.length === 0) {
    console.error('Error update client root payment record: ');
    console.error({
      orderId,
      updateData,
    });

    return null;
  }
  const record = partnerPaymentRecords[0];
  const recordId = record.id;

  if (recordId) {
    await updatePaymentRecordOnFirebase(recordId, updateData);
  }
};
