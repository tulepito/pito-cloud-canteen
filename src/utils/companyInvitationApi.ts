import { post } from './api';

export type CheckInvitationApiBody = {
  companyId: string;
};
export const checkInvitationApi = (body: CheckInvitationApiBody) =>
  post('/api/invitation/check-invitation', body);

export type ResponseToInvitationApiBody = {
  response: 'accept' | 'decline';
  companyId: string;
};
export const reponseToInvitationApi = (body: ResponseToInvitationApiBody) =>
  post('/api/invitation/response', body);
