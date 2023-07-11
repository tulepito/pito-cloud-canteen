import flatten from 'lodash/flatten';
import uniq from 'lodash/uniq';
import * as XLSX from 'xlsx';

import { formatTimestamp } from '@src/utils/dates';
import type { TObject } from '@src/utils/types';

export const parseEntitiesToExportCsv = (
  orders: TObject[],
  exportColumns: string[],
) => {
  if (orders.length === 0 || exportColumns.length === 0) return [];
  const hasTitleCol = exportColumns.includes('title');
  const hasOrderCreatedAtCol = exportColumns.includes('orderCreatedAt');
  const hasCompanyNameCol = exportColumns.includes('companyName');
  const hasBookerPhoneNumberCol = exportColumns.includes('bookerPhoneNumber');
  const hasCompanyAddressCol = exportColumns.includes('address');
  const hasDeliveryDate = exportColumns.includes('deliveryDate');
  const hasTotalDishes = exportColumns.includes('totalDishes');
  const hasOrderNotes = exportColumns.includes('orderNotes');
  const hasPartners = exportColumns.includes('restaurants');
  const hasSubOrders = exportColumns.includes('normal');
  const hasParentOrder = exportColumns.includes('group');
  const hasPartnersPhoneNumbers = exportColumns.includes('partnerPhoneNumber');
  const hasPartnersAddress = exportColumns.includes('partnerAddress');

  const orderToExport = orders.map((order) => {
    const {
      title,
      orderCreatedAt,
      companyName,
      bookerPhoneNumber,
      companyLocation,
      totalDishes,
      startDate,
      endDate,
      children = [],
      restaurants = [],
      fullRestaurantsData,
      orderNotes = {},
      orderNote,
      partnerLocation,
      deliveryHour,
    } = order.data || {};

    const parentOrderData = {
      ...(hasTitleCol && { 'Mã đơn': title }),
      ...(hasOrderCreatedAtCol && {
        'Ngày tạo đơn': orderCreatedAt,
      }),
      ...(hasCompanyNameCol && { 'Tên công ty': companyName }),
      ...(hasBookerPhoneNumberCol && {
        'SĐT người đại diện': bookerPhoneNumber,
      }),
      ...(hasCompanyAddressCol && { 'Địa chỉ công ty': companyLocation }),
      ...(hasDeliveryDate && {
        'Ngày giao hàng': `${deliveryHour}\n${startDate}-${endDate}`,
      }),
      ...(hasTotalDishes && { 'Số phần ăn': totalDishes }),
      ...(hasOrderNotes && {
        'Ghi chú đơn hàng': orderNote,
      }),
      ...(hasPartners && {
        'Đối tác': restaurants.join('\n'),
      }),
      ...(hasPartnersPhoneNumbers && {
        'SĐT đối tác': uniq(
          fullRestaurantsData.map((item: any) => item.phoneNumber || ''),
        ).join('\n'),
      }),
      ...(hasPartnersAddress && {
        'Địa chỉ đối tác': partnerLocation.join('\n'),
      }),
    };

    const subOrdersData = hasSubOrders
      ? children.map((child: any) => ({
          ...(hasTitleCol && { 'Mã đơn': child.data.title }),
          ...(hasOrderCreatedAtCol && {
            'Ngày tạo đơn': orderCreatedAt,
          }),
          ...(hasCompanyNameCol && { 'Tên công ty': companyName }),
          ...(hasBookerPhoneNumberCol && {
            'SĐT người đại diện': bookerPhoneNumber,
          }),
          ...(hasCompanyAddressCol && { 'Địa chỉ công ty': companyLocation }),
          ...(hasDeliveryDate && {
            'Ngày giao hàng': child.data.subOrderDate,
          }),
          ...(hasTotalDishes && { 'Số phần ăn': child.data.totalDishes }),
          ...(hasOrderNotes && {
            'Ghi chú đơn hàng': orderNotes[child.key],
          }),
          ...(hasPartners && {
            'Đối tác': child.data.restaurants.join('\n'),
          }),
          ...(hasPartnersPhoneNumbers && {
            'SĐT đối tác': child.data.partnerPhoneNumber,
          }),
          ...(hasPartnersAddress && {
            'Địa chỉ đối tác': child.data.partnerLocation,
          }),
        }))
      : [];

    if (!hasTitleCol || (hasTitleCol && !hasSubOrders && !hasParentOrder)) {
      return parentOrderData;
    }

    let exportedFinalItems: any = [];
    if (hasParentOrder) {
      exportedFinalItems = [parentOrderData];
    }
    if (hasSubOrders) {
      exportedFinalItems = [...exportedFinalItems, ...subOrdersData];
    }

    return exportedFinalItems;
  });

  return flatten(orderToExport);
};

export const makeExcelFile = (data: any, exportColumns: string[]) => {
  const foodsToExport = parseEntitiesToExportCsv(data, exportColumns);
  const ws = XLSX.utils.json_to_sheet(foodsToExport);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(
    wb,
    `${formatTimestamp(new Date().getTime())}_Danh_sách_đơn_hàng.xlsx`,
  );
};
