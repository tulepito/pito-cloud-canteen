import { ENativeNotificationType } from '@src/utils/enums';
import type { TListing } from '@src/utils/types';

import { pushNativeNotificationSubOrderDate } from './pushNotificationOrderDetailHelper';

function detectOrderLinesChanged(
  currentLineItems: any[],
  previousLineItems: any[],
) {
  const result = currentLineItems.findIndex((currentlineItem) => {
    const previousLineItem = previousLineItems.find(
      (lineItem) => lineItem.id && lineItem.id === currentlineItem.id,
    );

    return (
      !previousLineItem ||
      previousLineItem.quantity !== currentlineItem.quantity
    );
  });

  return result >= 0;
}

export async function pushNotificationOrderDetailChanged(
  currentOrderDetail: any,
  previousOrderDetail: any,
  order: TListing,
  sdk: any,
) {
  if (!currentOrderDetail) return;

  Object.keys(currentOrderDetail).forEach(async (orderDetailTimestamp) => {
    const { id: restaurantId } =
      currentOrderDetail[orderDetailTimestamp].restaurant;
    const currentLineItems: any[] =
      currentOrderDetail[orderDetailTimestamp].lineItems;
    const previousLineItems: any[] =
      previousOrderDetail[orderDetailTimestamp].lineItems;

    if (
      restaurantId &&
      (!previousLineItems ||
        previousLineItems.length !== currentLineItems.length ||
        detectOrderLinesChanged(currentLineItems, previousLineItems))
    ) {
      await pushNativeNotificationSubOrderDate(
        restaurantId,
        orderDetailTimestamp,
        order,
        ENativeNotificationType.AdminUpdateOrder,
        sdk,
      );
    }
  });
}
