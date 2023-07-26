import * as XLSX from 'xlsx';

import { parseThousandNumber } from '@helpers/format';
import { formatTimestamp } from '@src/utils/dates';
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

export const parseEntitiesToExportCsv = (paymentRecords: any[]) => {
  const exportedData = paymentRecords.map((paymentRecord) => {
    const {
      orderTitle,
      partnerName,
      subOrderDate,
      companyName,
      deliveryHour,
      totalAmount,
      paidAmount,
      remainAmount,
      status,
    } = paymentRecord.data || {};

    return {
      ID: orderTitle,
      'Đối tác': partnerName,
      'Tên đơn hàng': `${companyName}_${formatTimestamp(subOrderDate)}`,
      'Thời gian': `${deliveryHour} ${formatTimestamp(subOrderDate)}`,
      'Tổng giá trị': parseThousandNumber(totalAmount),
      'Đã thanh toán': parseThousandNumber(paidAmount),
      'Còn lại': parseThousandNumber(remainAmount),
      'Trạng thái': status === 'isPaid' ? 'Đã thanh toán' : 'Chưa thanh toán',
    };
  });

  return exportedData;
};

export const makeExcelFile = (data: any) => {
  const paymentRecordToExport = parseEntitiesToExportCsv(data);
  const ws = XLSX.utils.json_to_sheet(paymentRecordToExport);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(
    wb,
    `${formatTimestamp(
      new Date().getTime(),
    )}_Danh_sách_thanh_toán_đối_tác.xlsx`,
  );
};
