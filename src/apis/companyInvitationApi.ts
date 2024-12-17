import type { POSTResponseBody } from '@pages/api/invitation/response.api';

import { postApi } from './configs';

export const responseToInvitationApi = (body: POSTResponseBody) =>
  postApi('/invitation/response', body);
