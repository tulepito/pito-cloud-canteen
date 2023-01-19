import { deleteMethod, get, post } from './api';

export const checkEmailExistedApi = (email: string) =>
  get(`/api/users/check-email-existed/${email}`);

export type AddMembersApiBody = {
  userIdList: string[];
  noAccountEmailList: string[];
  companyId: string;
};
export const addMembersApi = (body: AddMembersApiBody) =>
  post('/api/company/members/add-members', body);

export type DeleteMemberApiBody = {
  data: {
    memberEmail: string;
    companyId: string;
  };
};
export const deleteMemberApi = (body: DeleteMemberApiBody) =>
  deleteMethod('/api/company/members/delete-member', body);
