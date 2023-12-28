import type { TListing, TUser } from '@src/utils/types';

export type TNativeNotificationPartnerParams = {
  order?: TListing;
  partner: TUser;
  foodName?: string;
  foodId?: string;
  subOrderDate?: string;
  partnerName?: string;
};
