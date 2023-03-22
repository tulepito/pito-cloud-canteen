export enum UserPermission {
  BOOKER = 'booker',
  ACCOUNTANT = 'accountant',
  PARTICIPANT = 'participant',
  OWNER = 'owner',
}

export enum UserInviteStatus {
  NOT_ACCEPTED = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

export enum UserInviteResponse {
  ACCEPT = 'accept',
  DECLINE = 'decline',
}
