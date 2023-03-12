import type { TObject } from '@utils/types';

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
  memberEmail: string;
  companyId: string;
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

export type GetGroupDetailApiParams = {
  groupId: string;
  page: number;
  perPage: number;
};
export const getGroupDetailApi = ({
  groupId,
  page,
  perPage,
}: GetGroupDetailApiParams) =>
  getApi(
    `/company/group/all-member?groupId=${groupId}&perPage=${perPage}&page=${page}`,
  );

export type CreateGroupApiBody = {
  companyId: string;
  groupInfo: {
    name: string;
  };
  groupMembers: {
    id: string;
    email: string;
  }[];
};
export const createGroupApi = (body: CreateGroupApiBody) =>
  postApi('/company/group', body);

export type UpdateGroupApiBody = {
  companyId: string;
  groupId: string;
  groupInfo?: {
    name?: string;
    description?: string;
  };
  addedMembers?: {
    id: string;
    email: string;
  }[];
  deletedMembers?: {
    id: string;
    email: string;
  }[];
};
export const updateGroupApi = (body: UpdateGroupApiBody) =>
  putApi('/company/group', body);

export type DeleteGroupApiData = {
  companyId: string;
  groupId: string;
};
export const deleteGroupApi = (data: DeleteGroupApiData) =>
  deleteApi('/company/group', data);

const queryOrdersApi = (companyId: string, params: TObject = {}) => {
  return getApi(`/company/${companyId}/orders`, params);
};

export const companyApi = {
  queryOrdersApi,
};

export const getAllCompanyMembersApi = (companyId: string) =>
  getApi(`/company/all-employees?companyId=${companyId}`);

export const favoriteRestaurantApi = (
  companyId: string,
  restaurantId: string,
) =>
  postApi(`/company/${companyId}/favorite-restaurant/${restaurantId}`, {
    companyId,
    restaurantId,
  });

export const fetchCompanyInfo = (companyId: string) =>
  getApi(`/company/${companyId}`);
