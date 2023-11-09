import uniq from 'lodash/uniq';

import {
  calculatePriceQuotationPartner,
  vatPercentageBaseOnVatSetting,
} from '@helpers/order/cartInfoHelper';
import { Listing } from '@src/utils/data';
import { EPartnerVATSetting } from '@src/utils/enums';
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
      const { companyId, serviceFees, vatSettings } =
        orderListing.getMetadata();

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
