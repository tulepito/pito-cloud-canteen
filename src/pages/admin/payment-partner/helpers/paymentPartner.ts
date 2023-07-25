import type { TObject } from '@src/utils/types';

export const filterPaymentPartner = (
  paymentRecords: any[],
  filterList: TObject,
) => {
  const { partnerName, orderTitle, startDate, endDate, status } = filterList;

  const filterFn = (item: any) => {
    if (partnerName && !`${item.data.partnerName}`.includes(partnerName))
      return false;
    if (orderTitle && !`${item.data.orderTitle}`.includes(orderTitle))
      return false;
    if (startDate && +item.data.subOrderDate < startDate) return false;
    if (endDate && +item.data.subOrderDate > endDate) return false;
    if (status && !status.includes(item.data.status)) return false;

    return true;
  };

  return paymentRecords.filter(filterFn);
};
