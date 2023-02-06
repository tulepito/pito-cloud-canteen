import { deleteApi, getApi, postApi, putApi } from './configs';

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

export type UpdateCompanyApiBody = {
  companyId: string;
  dataParams: {
    id: string;
    publicData?: {
      [key: string]: any;
    };
    metadata?: {
      [key: string]: any;
    };
  };
  queryParams: {
    expand: boolean;
    include?: string[];
    [key: string]: any;
  };
};
export const updateCompany = (body: UpdateCompanyApiBody) =>
  putApi(`/company`, body);
