import { User } from '@src/utils/data';
import type { ECompanyPermission } from '@src/utils/enums';
import type { TCurrentUser } from '@src/utils/types';

export const checkRoleOfCurrentUser = (
  userToCheck: TCurrentUser | undefined | null,
  roles: ECompanyPermission[],
) => {
  if (!userToCheck) return false;

  const {
    company = {},
    members: companyMembers = {},
    id,
    isAdmin,
  } = User(userToCheck).getMetadata();

  // If user is not logged in, break the check logic
  if (!id) return false;

  // If user is admin, break the check logic
  if (isAdmin) return false;

  const allCompanyRoles = Object.values(company || {}).map(
    (userData) => (userData as { permission: ECompanyPermission }).permission,
  );

  // If user has company roles, check if the user has the required role
  if (allCompanyRoles.length) {
    return roles.some((role) => allCompanyRoles.includes(role));
  }

  const currentUserDataInCompany = Object.entries(companyMembers || {}).find(
    ([, userData]) => {
      return (userData as { id: string }).id === id;
    },
  );

  if (!currentUserDataInCompany) {
    return false;
  }

  const [, currentUserData] = currentUserDataInCompany;

  return roles.includes(
    (currentUserData as { permission: ECompanyPermission }).permission,
  );
};
