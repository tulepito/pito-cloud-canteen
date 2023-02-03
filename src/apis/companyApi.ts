import type { TObject } from '@utils/types';

import { deleteApi, getApi, postApi } from './configs';

export const checkEmailExistedApi = (email: string) =>
  getApi(`/users/check-email-existed/${email}`);

export type AddMembersApiBody = {
  userIdList: string[];
  noAccountEmailList: string[];
  companyId: string;
};
export const addMembersApi = (body: AddMembersApiBody) =>
  postApi('/company/members/add-members', body);

export type DeleteMemberApiBody = {
  data: {
    memberEmail: string;
    companyId: string;
  };
};
export const deleteMemberApi = (body: DeleteMemberApiBody) =>
  deleteApi('/api/company/members/delete-member', body);

const queryOrdersApi = (companyId: string, params: TObject = {}) =>
  getApi(`/api/company/${companyId}/orders`, params);

export const companyApi = {
  queryOrdersApi,
};
