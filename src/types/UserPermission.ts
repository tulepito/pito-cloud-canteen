export enum UserPermission {
  BOOKER = 'booker',
  ACCOUNTANT = 'accoutant',
  PARTICIPANT = 'participant',
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
