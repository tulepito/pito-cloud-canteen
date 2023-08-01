import type { TObject } from '@src/utils/types';

export const filterClientPayment = (
  paymentRecords: any[],
  filterList: TObject,
) => {
  const { companyName, orderTitle, startDate, endDate, status } = filterList;

  const filterFn = (item: any) => {
    if (
      companyName &&
      !`${item.data.companyName}`
        .toLocaleLowerCase()
        .includes(companyName.toLocaleLowerCase())
    )
      return false;
    if (
      orderTitle &&
      !`${item.data.orderTitle}`
        .toLocaleLowerCase()
        .includes(orderTitle.toLocaleLowerCase())
    )
      return false;
    if (startDate && +item.data.subOrderDate < startDate) return false;
    if (endDate && +item.data.subOrderDate > endDate) return false;
    if (status && !status.includes(item.data.status)) return false;

    return true;
  };

  return paymentRecords.filter(filterFn);
};
