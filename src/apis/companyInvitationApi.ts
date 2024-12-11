import type { ResponseToInvitationBody } from '@pages/api/invitation/response.api';

import { postApi } from './configs';

export type CheckInvitationApiBody = {
  companyId: string;
};
export const checkInvitationApi = (body: CheckInvitationApiBody) =>
  postApi('/invitation/check-invitation', body);

export const responseToInvitationApi = (body: ResponseToInvitationBody) =>
  postApi('/invitation/response', body);
