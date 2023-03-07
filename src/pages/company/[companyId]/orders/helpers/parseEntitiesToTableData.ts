import uniq from 'lodash/uniq';

import { combineOrderDetailWithPriceInfo } from '@helpers/orderHelper';
import { calculatePriceQuotationInfo } from '@pages/company/orders/[orderId]/picking/helpers/cartInfoHelper';
import { Listing } from '@utils/data';
import { formatTimestamp } from '@utils/dates';
import type { TIntegrationOrderListing, TListing } from '@utils/types';

export const parseEntitiesToTableData = (
  orders: TIntegrationOrderListing[],
  page: number,
) => {
  return orders.map((entity, index) => {
    const { plan = {} } = entity;
    const orderId = entity?.id?.uuid;
    const { orderDetail: planOrderDetail = {} } = Listing(
      plan as TListing,
    ).getMetadata();

    const {
      startDate,
      companyId = '',
      endDate,
      deliveryHour,
      deliveryAddress,
      orderState,
    } = Listing(entity as TListing).getMetadata();

    const { totalWithVAT } = calculatePriceQuotationInfo({
      order: entity,
      planOrderDetail,
    });

    return {
      key: orderId,
      data: {
        id: orderId,
        title: entity.attributes.title,
        orderNumber: (page - 1) * 10 + index + 1,
        location: deliveryAddress?.address,
        startDate: startDate ? formatTimestamp(startDate) : '',
        endDate: endDate ? formatTimestamp(endDate) : '',
        state: orderState,
        orderId,
        companyId,
        plan: {
          ...plan,
          attributes: {
            ...(plan as TListing).attributes,
            metadata: {
              ...(plan as TListing).attributes.metadata,
              orderDetail: combineOrderDetailWithPriceInfo({
                orderDetail: planOrderDetail,
              }),
            },
          },
        },
        restaurants: uniq(
          Object.keys(planOrderDetail).map((key) => {
            return planOrderDetail[key]?.restaurant?.restaurantName;
          }),
        ),
        orderName: entity.attributes.publicData.orderName,
        deliveryHour,
        totalWithVAT,
      },
    };
  });
};
