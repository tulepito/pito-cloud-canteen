import { EUserRole, EUserSystemPermission } from '@src/utils/enums';

export const mapUserPermissionByRole = (role: EUserRole) => {
  switch (role) {
    case EUserRole.admin:
      return EUserSystemPermission.admin;
    case EUserRole.partner:
      return EUserSystemPermission.partner;
    case EUserRole.company:
    case EUserRole.booker:
      return EUserSystemPermission.company;
    case EUserRole.participant:
      return EUserSystemPermission.normal;
    default:
      return EUserSystemPermission.normal;
  }
};
