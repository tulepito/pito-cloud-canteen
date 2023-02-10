import { calculatePriceQuotationInfo } from '@pages/orders/[orderId]/helpers/cartInfoHelper';
import { Listing } from '@utils/data';
import { parseTimestampToFormat } from '@utils/dates';
import { EOrderStates } from '@utils/enums';
import type { TIntegrationOrderListing, TListing } from '@utils/types';
import uniq from 'lodash/uniq';

export const parseEntitiesToTableData = (
  orders: TIntegrationOrderListing[],
  page: number,
) => {
  return orders.map((entity, index) => {
    const { plan } = entity;
    const orderId = entity?.id?.uuid;
    const { orderDetail: planOrderDetail = {} } = Listing(
      plan as TListing,
    ).getMetadata();

    const {
      startDate = 0,
      companyId = '',
      endDate = 0,
      deliveryHour,
      deliveryAddress,
      orderState = EOrderStates.isNew,
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
        startDate: parseTimestampToFormat(startDate),
        endDate: parseTimestampToFormat(endDate),
        state: orderState,
        orderId,
        companyId,
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
