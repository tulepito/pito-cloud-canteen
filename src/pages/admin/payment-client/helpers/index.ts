/* eslint-disable @typescript-eslint/no-shadow */
import * as XLSX from 'xlsx';

import { parseThousandNumber } from '@helpers/format';
import { formatTimestamp } from '@src/utils/dates';
import { removeAccents } from '@src/utils/string';
import type { TObject } from '@src/utils/types';

export const filterClientPayment = (
  paymentRecords: any[],
  filterList: TObject,
) => {
  const {
    companyName: filterCompanyName,
    companyId: filterCompanyId,
    orderTitle: filterOrderTitle,
    startDate: filterStartDate,
    endDate: filterEndDate,
    status: filterStatus,
    partnerId: filterPartnerId,
    bookerIds: filterBookerIds,
    restaurantName: filterRestaurantName,
  } = filterList;

  const filterFn = (item: any) => {
    const {
      companyName,
      orderTitle,
      status,
      startDate,
      endDate,
      restaurants = [],
      company = {},
      booker = {},
    } = item.data;

    if (
      filterCompanyName &&
      !`${companyName}`
        .toLocaleLowerCase()
        .includes(filterCompanyName.toLocaleLowerCase())
    )
      return false;

    if (
      filterBookerIds &&
      filterBookerIds.length > 0 &&
      !filterBookerIds.includes(booker.bookerId)
    )
      return false;

    if (filterCompanyId && company.companyId !== filterCompanyId) return false;

    if (
      filterOrderTitle &&
      !`${orderTitle}`
        .toLocaleLowerCase()
        .includes(filterOrderTitle.toLocaleLowerCase())
    )
      return false;

    if (filterStartDate && startDate < filterStartDate) return false;

    if (filterEndDate && endDate > filterEndDate) return false;

    if (
      filterStatus &&
      filterStatus.length > 0 &&
      !filterStatus.includes(status)
    )
      return false;

    if (
      filterPartnerId &&
      !restaurants.some((item: any) => item.restaurantId === filterPartnerId)
    )
      return false;

    if (
      filterRestaurantName &&
      !restaurants.some((item: any) =>
        removeAccents(item.restaurantName)
          .toLocaleLowerCase()
          .includes(removeAccents(filterRestaurantName).toLocaleLowerCase()),
      )
    )
      return false;

    return true;
  };

  return paymentRecords.filter(filterFn);
};

export const parseEntitiesToExportCsv = (paymentRecords: any[]) => {
  const exportedData = paymentRecords.map((paymentRecord) => {
    const {
      orderTitle,
      company,
      startDate,
      endDate,
      deliveryHour,
      totalAmount,
      paidAmount,
      remainAmount,
      status,
    } = paymentRecord.data || {};

    return {
      ID: orderTitle,
      'Khách hàng': company?.companyName,
      'Tên đơn hàng': `${company?.companyName}_${formatTimestamp(
        startDate,
      )} - ${formatTimestamp(endDate)}`,
      'Thời gian': `${deliveryHour} ${formatTimestamp(
        startDate,
      )} - ${formatTimestamp(endDate)}`,
      'Tổng giá trị': parseThousandNumber(totalAmount),
      'Đã thanh toán': parseThousandNumber(paidAmount),
      'Còn lại': parseThousandNumber(remainAmount),
      'Trạng thái': status === 'isPaid' ? 'Đã thanh toán' : 'Chưa thanh toán',
    };
  });

  return exportedData;
};

export const makeClientPaymentExcelFile = (data: any) => {
  const paymentRecordToExport = parseEntitiesToExportCsv(data);
  const ws = XLSX.utils.json_to_sheet(paymentRecordToExport);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(
    wb,
    `${formatTimestamp(
      new Date().getTime(),
    )}_Danh_sách_thanh_toán_khách hàng.xlsx`,
  );
};
