import { calculatePriceQuotationInfo } from '@pages/orders/[orderId]/helpers/cartInfoHelper';
import { LISTING } from '@utils/data';
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
    const { orderDetail: planOrderDetail } = LISTING(
      plan as TListing,
    ).getMetadata();
    const {
      orderDetail = {},
      generalInfo = {},
      orderState = EOrderStates.isNew,
    } = LISTING(entity as TListing).getMetadata();
    const {
      startDate = 0,
      endDate = 0,
      deliveryHour,
      deliveryAddress,
    } = generalInfo;

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
        restaurants: uniq(
          Object.keys(orderDetail).map((key) => {
            return orderDetail[key]?.restaurant?.restaurantName;
          }),
        ),
        orderDetail,
        orderName: entity.attributes.publicData.orderName,
        deliveryHour,
        totalWithVAT,
      },
    };
  });
};
