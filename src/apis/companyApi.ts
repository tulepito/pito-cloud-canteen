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

export const adminDeleteMemberApi = ({
  memberEmail,
  companyId,
}: DeleteMemberApiBody) =>
  deleteApi(`/admin/users/company/${companyId}/members/delete`, {
    memberEmail,
  });

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

export const getCompanyNotificationsApi = (companyId: string) => {
  return getApi(`/company/${companyId}/orders/notifications`);
};

export const getCompanyOrderSummaryApi = (companyId: string) => {
  return getApi(`/company/${companyId}/orders/summary`);
};

export const companyApi = {
  queryOrdersApi,
};

export const getAllCompanyMembersApi = (companyId: string) =>
  getApi(`/company/all-employees?companyId=${companyId}`);

export const queryMembersByEmailAdminApi = (
  emails: string[],
  queryParams?: TObject,
) => {
  return getApi(`/admin/users/company/query-new-members-by-email`, {
    dataParams: { emails },
    queryParams,
  });
};

export const adminAddMembersToCompanyApi = (
  companyId: string,
  dataParams?: TObject,
  queryParams?: TObject,
) => {
  return postApi(`/admin/users/company/${companyId}/members/add`, {
    dataParams,
    queryParams,
  });
};

export const adminDeleteGroupApi = ({
  companyId,
  groupId,
}: DeleteGroupApiData) =>
  deleteApi(`/admin/users/company/${companyId}/groups/delete`, {
    companyId,
    groupId,
  });

export const adminCreateGroupApi = ({
  companyId,
  ...rest
}: CreateGroupApiBody) =>
  postApi(`/admin/users/company/${companyId}/groups/create`, rest);

export const adminUpdateGroupApi = ({
  companyId,
  ...rest
}: UpdateGroupApiBody) =>
  postApi(`/admin/users/company/${companyId}/groups/update`, rest);

export type TUpdateMemberPermissionApiParams = {
  companyId: string;
  memberEmail: string;
  permission: string;
};

export const adminUpdateMemberPermissionApi = ({
  companyId,
  ...rest
}: TUpdateMemberPermissionApiParams) =>
  putApi(`/admin/users/company/${companyId}/members/update-permission`, rest);

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

export type TAdminTransferCompanyOwnerParams = {
  companyId: string;
  newOwnerEmail: string;
  permissionForOldOwner?: string;
  newOwnerProfileImageId?: string;
};

export const adminTransferCompanyOwnerApi = ({
  companyId,
  newOwnerEmail,
  permissionForOldOwner,
  newOwnerProfileImageId,
}: TAdminTransferCompanyOwnerParams) =>
  postApi(`/admin/users/company/${companyId}/transfer-owner`, {
    newOwnerEmail,
    newOwnerProfileImageId,
    permissionForOldOwner,
  });
