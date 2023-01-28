import { postApi } from './configs';

export type CheckInvitationApiBody = {
  companyId: string;
};
export const checkInvitationApi = (body: CheckInvitationApiBody) =>
  postApi('/api/invitation/check-invitation', body);

export type ResponseToInvitationApiBody = {
  response: 'accept' | 'decline';
  companyId: string;
};
export const reponseToInvitationApi = (body: ResponseToInvitationApiBody) =>
  postApi('/api/invitation/response', body);
