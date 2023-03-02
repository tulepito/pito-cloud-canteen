import { Listing } from '@utils/data';
import type { TListing } from '@utils/types';

export const isGeneralInfoSetupCompleted = (order: TListing) => {
  const {
    deliveryAddress,
    startDate,
    endDate,
    deadlineDate,
    packagePerMember,
  } = Listing(order).getMetadata();

  return (
    !!deliveryAddress &&
    !!startDate &&
    !!endDate &&
    !!deadlineDate &&
    !!packagePerMember
  );
};
