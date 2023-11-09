import uniq from 'lodash/uniq';

import {
  calculatePriceQuotationPartner,
  calculateTotalPriceAndDishes,
  vatPercentageBaseOnVatSetting,
} from '@helpers/order/cartInfoHelper';
import { Listing } from '@src/utils/data';
import { EOrderType, EPartnerVATSetting } from '@src/utils/enums';
import type { TListing, TObject } from '@src/utils/types';

export const calculateOverviewInformation = (
  subOrders: TObject[],
  restaurantListingId: string,
  currentOrderVATPercentage: number,
) => {
  const overviewInformation = subOrders.reduce(
    (result, subOrder) => {
      const { revenue, totalOrders, totalCustomers } = result;
      const { plan, quotation = {} } = subOrder;
      const orderListing = Listing(subOrder as TListing);
      const planListing = Listing(plan as TListing);
      const {
        companyId,
        serviceFees = {},
        vatSettings = {},
      } = orderListing.getMetadata();

      const { orderDetail = {} } = planListing.getMetadata();

      const vatSettingFromOrder = vatSettings[restaurantListingId];
      const partnerVATSetting =
        vatSettingFromOrder in EPartnerVATSetting
          ? vatSettingFromOrder
          : EPartnerVATSetting.vat;
      const vatPercentage = vatPercentageBaseOnVatSetting({
        vatSetting: partnerVATSetting,
        vatPercentage: currentOrderVATPercentage,
      });
      const partnerQuotation = calculatePriceQuotationPartner({
        quotation: quotation[restaurantListingId].quotation,
        serviceFeePercentage: serviceFees[restaurantListingId],
        currentOrderVATPercentage: vatPercentage,
        shouldSkipVAT: partnerVATSetting === EPartnerVATSetting.direct,
      });

      const bulkSubOrders = Object.keys(orderDetail).filter(
        (subOrderDate: string) =>
          orderDetail[subOrderDate].restaurant.id === restaurantListingId,
      );

      return {
        revenue: revenue + partnerQuotation.totalPrice,
        totalOrders: totalOrders + bulkSubOrders.length,
        totalCustomers: uniq([...totalCustomers, companyId]),
      };
    },
    {
      revenue: 0,
      totalOrders: 0,
      totalCustomers: [],
    },
  );

  return overviewInformation;
};

export const splitSubOrders = (
  subOrders: TObject[],
  restaurantListingId: string,
  currentOrderVATPercentage: number,
) => {
  const splittedSubOrders = subOrders.reduce((result: TObject[], order) => {
    const orderListing = Listing(order as TListing);
    const { plan, quotation } = order;
    const planListing = Listing(plan as TListing);
    const { orderDetail = {} } = planListing.getMetadata();
    const {
      serviceFees = {},
      vatSettings = {},
      companyName,
      deliveryHour,
      orderType = EOrderType.group,
    } = orderListing.getMetadata();
    const isGroupOrder = orderType === EOrderType.group;
    const { title: orderTitle } = orderListing.getAttributes();
    const orderId = orderListing.getId();

    const bulkSubOrders = Object.keys(orderDetail).reduce(
      (partnerSubOrders: any, subOrderDate) => {
        const { restaurant = {}, lastTransition } = orderDetail[subOrderDate];
        const { id: restaurantId } = restaurant;
        if (restaurantId !== restaurantListingId) {
          return partnerSubOrders;
        }
        const dayIndex = new Date(Number(subOrderDate)).getDay();
        const subOrderTitle = `${orderTitle}-${dayIndex > 0 ? dayIndex : 7}`;

        const vatSettingFromOrder = vatSettings[restaurantListingId];
        const partnerVATSetting =
          vatSettingFromOrder in EPartnerVATSetting
            ? vatSettingFromOrder
            : EPartnerVATSetting.vat;
        const vatPercentage = vatPercentageBaseOnVatSetting({
          vatSetting: partnerVATSetting,
          vatPercentage: currentOrderVATPercentage,
        });
        const partnerQuotation = calculatePriceQuotationPartner({
          quotation: quotation[restaurantListingId].quotation,
          serviceFeePercentage: serviceFees[restaurantListingId],
          currentOrderVATPercentage: vatPercentage,
          shouldSkipVAT: partnerVATSetting === EPartnerVATSetting.direct,
        });

        const { totalDishes } = calculateTotalPriceAndDishes({
          orderDetail,
          isGroupOrder,
          date: subOrderDate,
        });

        return [
          ...partnerSubOrders,
          {
            subOrderTitle,
            companyName,
            subOrderDate,
            deliveryHour,
            lastTransition,
            revenue: partnerQuotation.totalPrice,
            totalDishes,
            subOrderId: `${orderId}_${subOrderDate}`,
          },
        ];
      },
      [],
    );

    return [...result, ...bulkSubOrders];
  }, []);

  return splittedSubOrders;
};
