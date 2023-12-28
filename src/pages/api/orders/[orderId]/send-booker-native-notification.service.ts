import { fetchUser } from '@services/integrationHelper';
import { createNativeNotificationToBooker } from '@services/nativeNotification';
import { Listing } from '@src/utils/data';
import type { EBookerNativeNotificationType } from '@src/utils/enums';
import type { TListing } from '@src/utils/types';

export const sendBookerNativeNotification = async (
  order: TListing,
  notiType: EBookerNativeNotificationType,
) => {
  const orderListing = Listing(order);
  const { bookerId } = orderListing.getMetadata();
  const booker = await fetchUser(bookerId);

  createNativeNotificationToBooker(notiType, {
    booker,
    order,
  });
};
