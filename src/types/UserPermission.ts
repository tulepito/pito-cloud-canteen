import { ECompanyPermission } from '@src/utils/enums';

export const CompanyPermissions = [
  ECompanyPermission.booker,
  ECompanyPermission.owner,
];

export enum UserInviteStatus {
  NOT_ACCEPTED = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

export enum UserInviteResponse {
  ACCEPT = 'accept',
  DECLINE = 'decline',
}
