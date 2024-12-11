import { ECompanyPermission } from '@src/utils/enums';

interface User {
  attributes?: {
    profile?: {
      metadata?: {
        company?: {
          [key: string]: {
            permission: ECompanyPermission;
          };
        };
      };
    };
  };
}

const checkUserPermission = (
  currentUser: User,
  permissions: ECompanyPermission[],
) => {
  const { company } = currentUser.attributes?.profile?.metadata || {};

  return Object.values(company || {}).some(({ permission }) => {
    return permissions.includes(permission);
  });
};

export const isUserABookerOrOwner = (currentUser: User) => {
  return checkUserPermission(currentUser, [
    ECompanyPermission.booker,
    ECompanyPermission.owner,
  ]);
};

export const isUserAParticipant = (currentUser: User) => {
  return checkUserPermission(currentUser, [ECompanyPermission.participant]);
};
