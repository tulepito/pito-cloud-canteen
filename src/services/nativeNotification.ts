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
  const { firstName } = participantUser.getProfile();
  const { oneSignalUserIds = [] } = participantUser.getPrivateData();

  if (oneSignalUserIds.length === 0) return;

  switch (notificationType) {
    case ENativeNotificationType.BookerTransitOrderStateToPicking:
      {
        const { order } = notificationParams;
        const orderListing = Listing(order!);
        const orderId = orderListing.getId();
        const { startDate, endDate } = orderListing.getMetadata();
        const url = `${BASE_URL}/participant/order/${orderId}/?subOrderDate=${startDate}&viewMode=week`;
        oneSignalUserIds.forEach((oneSignalUserId: string) => {
          sendNotification({
            title: `Bạn muốn ăn gì nào 🤔 ?`,
            content: `Tuần ăn ${formatTimestamp(
              +startDate,
              'dd/MM',
            )}-${formatTimestamp(
              +endDate,
              'dd/MM',
            )} đã sẵn sàng, mời ${firstName} chọn món nhé!`,
            url,
            oneSignalUserId,
          });
        });
      }
      break;
    case ENativeNotificationType.BookerTransitOrderStateToInProgress:
      {
        const { order } = notificationParams;
        const orderListing = Listing(order!);
        const orderId = orderListing.getId();
        const { startDate, endDate } = orderListing.getMetadata();
        const url = `${BASE_URL}/participant/order/${orderId}/?subOrderDate=${startDate}&viewMode=week`;

        oneSignalUserIds.forEach((oneSignalUserId: string) => {
          sendNotification({
            title: 'Tuần ăn đã đặt',
            content: `Tuần ăn ${formatTimestamp(
              +startDate,
              'dd/MM',
            )}-${formatTimestamp(
              +endDate,
              'dd/MM',
            )} của ${firstName} được đặt thành công`,
            url,
            oneSignalUserId,
          });
        });
      }
      break;
    case ENativeNotificationType.AdminTransitSubOrderToDelivering:
      {
        const { foodName, planId, subOrderDate } = notificationParams;
        const url = `${BASE_URL}/participant/orders/?planId=${planId}&timestamp=${subOrderDate}&viewMode=week`;

        oneSignalUserIds.forEach((oneSignalUserId: string) => {
          sendNotification({
            title: '🛵 🛵 🛵 Cơm sắp đến',
            content: `🌟 ${foodName} sắp đến rồi. Chuẩn bị ăn thôi`,
            url,
            oneSignalUserId,
          });
        });
      }
      break;
    case ENativeNotificationType.AdminTransitSubOrderToDelivered:
      {
        const { foodName, planId, subOrderDate } = notificationParams;
        const url = `${BASE_URL}/participant/orders/?planId=${planId}&timestamp=${subOrderDate}&viewMode=week`;

        oneSignalUserIds.forEach((oneSignalUserId: string) => {
          sendNotification({
            title: 'Đã có cơm 😍 😍 😍',
            content: `${foodName} đã được giao đến bạn. Chúc ${firstName} ngon miệng.`,
            url,
            oneSignalUserId,
          });
        });
      }
      break;
    case ENativeNotificationType.AdminTransitSubOrderToCanceled:
      {
        const { planId, subOrderDate } = notificationParams;
        const url = `${BASE_URL}/participant/orders/?planId=${planId}&timestamp=${subOrderDate}&viewMode=week`;

        oneSignalUserIds.forEach((oneSignalUserId: string) => {
          sendNotification({
            title: 'Opps! Ngày ăn bị hủy!',
            content: `😢 ${firstName} ơi, rất tiếc phải thông báo ngày ăn ${formatTimestamp(
              +subOrderDate!,
              'dd/MM',
            )} đã bị hủy`,
            url,
            oneSignalUserId,
          });
        });
      }
      break;
    case ENativeNotificationType.TransitOrderStateToCanceled:
      {
        const { order, planId } = notificationParams;
        const orderListing = Listing(order!);
        const { startDate, endDate } = orderListing.getMetadata();
        const url = `${BASE_URL}/participant/orders/?planId=${planId}&timestamp=${startDate}&viewMode=week`;

        oneSignalUserIds.forEach((oneSignalUserId: string) => {
          sendNotification({
            title: 'Opps! Tuần ăn bị hủy!',
            content: `😢 ${firstName} ơi, rất tiếc phải thông báo tuần ăn ${formatTimestamp(
              +startDate!,
              'dd/MM',
            )}-${formatTimestamp(+endDate!, 'dd/MM')} đã bị hủy`,
            url,
            oneSignalUserId,
          });
        });
      }
      break;

    case ENativeNotificationType.PartnerTransitOrderToCanceled:
      {
        const { order, subOrderDate } = notificationParams;
        const orderListing = Listing(order!);
        const orderId = orderListing.getId();
        const { deliveryHour } = orderListing.getMetadata();
        const deliveryStartHour = deliveryHour.split('-')[0];
        const url = `${BASE_URL}/partner/orders/${orderId}_${subOrderDate}`;

        oneSignalUserIds.forEach((oneSignalUserId: string) => {
          sendNotification({
            title: '😢 Rất tiếc! Một đơn hàng vừa bi huỷ.',
            content: `Đơn hàng vào lúc ${deliveryStartHour}, ${formatTimestamp(
              +subOrderDate!,
              'dd/MM',
            )} vừa bị huỷ. Nhấn để xem chi tiết!`,
            url,
            oneSignalUserId,
          });
        });
      }
      break;

    default:
      break;
  }
};
