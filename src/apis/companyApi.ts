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
  deleteApi('/company/members/delete-member', body);
