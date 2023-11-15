import { isEmpty } from 'lodash';

import { Listing } from '@utils/data';
import type { TListing } from '@utils/types';

export const isGeneralInfoSetupCompleted = (order: TListing) => {
  const { deliveryAddress, startDate, endDate, packagePerMember } =
    Listing(order).getMetadata();

  return !!deliveryAddress && !!startDate && !!endDate && !!packagePerMember;
};

export function checkAllRestaurantsFoodPicked(orderDetail: any) {
  if (!orderDetail) {
    return false;
  }

  const missingSelectedFood = Object.keys(orderDetail).filter(
    (dateTime) =>
      !isEmpty(orderDetail[dateTime]?.restaurant?.id) &&
      isEmpty(orderDetail[dateTime]?.restaurant?.foodList),
  );

  return isEmpty(missingSelectedFood);
}
