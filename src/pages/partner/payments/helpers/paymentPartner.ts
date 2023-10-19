import isEmpty from 'lodash/isEmpty';
import * as XLSX from 'xlsx';

import { parseThousandNumber } from '@helpers/format';
import { formatTimestamp } from '@src/utils/dates';
import type { EOrderPaymentStatus } from '@src/utils/enums';
import { CONFIGS_BASE_ON_PAYMENT_STATUS } from '@src/utils/enums';
import type { TObject } from '@src/utils/types';

export const filterPayments = (paymentRecords: any[], filterList: TObject) => {
  const { subOrderName, orderTitle, startDate, endDate, status } = filterList;
  const isStartDateEmpty = typeof startDate === 'undefined';
  const isEndDateEmpty = typeof endDate === 'undefined';

  const filterFn = (item: any) => {
    const isValidWithStartDateMaybe =
      isStartDateEmpty || Number(item.data.subOrderDate) >= Number(startDate);
    const isValidWithEndDateMaybe =
      isEndDateEmpty || Number(item.data.subOrderDate) <= Number(endDate);

    return (
      (isEmpty(subOrderName) ||
        `${item.data.subOrderName}`
          .toLocaleLowerCase()
          .includes(subOrderName.toLocaleLowerCase())) &&
      (isEmpty(orderTitle) ||
        `#${item.data.orderTitle}`
          .toLocaleLowerCase()
          .includes(orderTitle.toLocaleLowerCase()) ||
        `${item.data.subOrderTitle}`
          .toLocaleLowerCase()
          .includes(orderTitle.toLocaleLowerCase())) &&
      isValidWithStartDateMaybe &&
      isValidWithEndDateMaybe &&
      (isEmpty(status) || status.includes(item.data.status))
    );
  };

  return paymentRecords.filter(filterFn);
};

export const parseEntitiesToExportCsv = (paymentRecords: any[]) => {
  const exportedData = paymentRecords.map((paymentRecord) => {
    const {
      orderTitle,
      subOrderDate,
      subOrderName,
      deliveryHour,
      totalAmount,
      paidAmount,
      remainAmount,
      status,
    } = paymentRecord.data || {};

    return {
      ID: orderTitle,
      'Tên đơn hàng': subOrderName,
      'Thời gian': `${deliveryHour} ${formatTimestamp(subOrderDate)}`,
      'Tổng giá trị': parseThousandNumber(totalAmount),
      'Đã thanh toán': parseThousandNumber(paidAmount),
      'Còn lại': parseThousandNumber(remainAmount),
      'Trạng thái':
        CONFIGS_BASE_ON_PAYMENT_STATUS[status as EOrderPaymentStatus].label,
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
