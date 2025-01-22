import type { UserListing } from '@src/types';
import { ECompanyPermission } from '@src/utils/enums';

const checkUserPermission = (
  currentUser: UserListing,
  permissions: ECompanyPermission[],
) => {
  const { company } = currentUser.attributes?.profile?.metadata || {};

  return Object.values(company || {}).some((value) => {
    if (!value) {
      return false;
    }

    const { permission } = value;

    return permission && permissions.includes(permission);
  });
};

export const isUserABookerOrOwner = (currentUser: UserListing) => {
  return checkUserPermission(currentUser, [
    ECompanyPermission.booker,
    ECompanyPermission.owner,
  ]);
};

export const isUserAParticipant = (currentUser: UserListing) => {
  return checkUserPermission(currentUser, [ECompanyPermission.participant]);
};
