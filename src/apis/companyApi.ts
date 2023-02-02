import { deleteApi, getApi, postApi } from './configs';

export const checkEmailExistedApi = (email: string) =>
  getApi(`/api/users/check-email-existed/${email}`);

export type AddMembersApiBody = {
  userIdList: string[];
  noAccountEmailList: string[];
  companyId: string;
};
export const addMembersApi = (body: AddMembersApiBody) =>
  postApi('/api/company/members/add-members', body);

export type DeleteMemberApiBody = {
  data: {
    memberEmail: string;
    companyId: string;
  };
};
export const deleteMemberApi = (body: DeleteMemberApiBody) =>
  deleteApi('/api/company/members/delete-member', body);

export const queryOrdersApi = (companyId: string, params = {}) =>
  getApi(`/api/company/${companyId}/orders`, params);
