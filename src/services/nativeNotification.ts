import { Listing, User } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';
import { ENativeNotificationType } from '@src/utils/enums';
import type { TListing } from '@src/utils/types';

import { fetchUser } from './integrationHelper';
import { sendNotification } from './oneSignal';

type NativeNotificationParams = {
  order?: TListing;
  participantId: string;
  foodName?: string;
  planId?: string;
  subOrderDate?: string;
};
const BASE_URL = process.env.NEXT_PUBLIC_CANONICAL_URL;

export const createNativeNotification = async (
  notificationType: ENativeNotificationType,
  notificationParams: NativeNotificationParams,
) => {
  const { participantId } = notificationParams;
  const participant = await fetchUser(participantId);
  const participantUser = User(participant);
  const { lastName } = participantUser.getAttributes();
  const { oneSignalUserId } = participantUser.getPrivateData();
  switch (notificationType) {
    case ENativeNotificationType.BookerTransitOrderStateToPicking:
      {
        const { order } = notificationParams;
        const orderListing = Listing(order!);
        const orderId = orderListing.getId();
        const { startDate, endDate } = orderListing.getMetadata();
        const url = `${BASE_URL}/participant/order/${orderId}`;
        sendNotification({
          title: `Bạn muốn ăn gì nào 🤔 ?`,
          content: `Tuần ăn ${formatTimestamp(
            +startDate,
            'dd/MM',
          )}-${formatTimestamp(
            +endDate,
            'dd/MM',
          )} đã sẵn sàng, mời ${lastName} chọn món nhé!`,
          url,
          oneSignalUserId,
        });
      }
      break;
    case ENativeNotificationType.BookerTransitOrderStateToInProgress:
      {
        const { order } = notificationParams;
        const orderListing = Listing(order!);
        const orderId = orderListing.getId();
        const { startDate, endDate } = orderListing.getMetadata();
        const url = `${BASE_URL}/participant/order/${orderId}`;
        sendNotification({
          title: 'Tuần ăn đã đặt',
          content: `Tuần ăn ${formatTimestamp(
            +startDate,
            'dd/MM',
          )}-${formatTimestamp(
            +endDate,
            'dd/MM',
          )} của ${lastName} được đặt thành công`,
          url,
          oneSignalUserId,
        });
      }
      break;
    case ENativeNotificationType.AdminTransitSubOrderToDelivering:
      {
        const { foodName, planId, subOrderDate } = notificationParams;
        const url = `${BASE_URL}/participant/orders/${planId}&${subOrderDate}`;
        sendNotification({
          title: '🛵 🛵 🛵 Cơm sắp đến',
          content: `🌟 ${foodName} sắp đến rồi. Chúc ${lastName} ngon miệng`,
          url,
          oneSignalUserId,
        });
      }
      break;
    case ENativeNotificationType.AdminTransitSubOrderToDelivered:
      {
        const { foodName, planId, subOrderDate } = notificationParams;
        const url = `${BASE_URL}/participant/orders/${planId}&${subOrderDate}&openRatingModal=true`;
        sendNotification({
          title: 'Đã có cơm 😍 😍 😍',
          content: `${foodName} đã được giao đến bạn. Chúc ${lastName} ngon miệng. `,
          url,
          oneSignalUserId,
        });
      }
      break;
    case ENativeNotificationType.AdminTransitSubOrderToCanceled:
      {
        const { planId, subOrderDate } = notificationParams;
        const url = `${BASE_URL}/participant/orders/${planId}&${subOrderDate}&openRatingModal=true`;
        sendNotification({
          title: 'Opps! Ngày ăn bị hủy!',
          content: `😢 ${lastName} ơi, rất tiếc phải thông báo ngày ăn ${formatTimestamp(
            +subOrderDate!,
            'dd/MM',
          )} đã bị hủy`,
          url,
          oneSignalUserId,
        });
      }
      break;
    case ENativeNotificationType.TransitOrderStateToCanceled:
      {
        const { order, planId } = notificationParams;
        const orderListing = Listing(order!);
        const { startDate, endDate } = orderListing.getMetadata();
        const url = `${BASE_URL}/participant/orders/${planId}&${startDate}&openRatingModal=true`;
        sendNotification({
          title: 'Opps! Tuần ăn bị hủy!',
          content: `😢 ${lastName} ơi, rất tiếc phải thông báo tuần ăn ${formatTimestamp(
            +startDate!,
            'dd/MM',
          )}-${formatTimestamp(+endDate!, 'dd/MM')} đã bị hủy`,
          url,
          oneSignalUserId,
        });
      }
      break;

    default:
      break;
  }
};
