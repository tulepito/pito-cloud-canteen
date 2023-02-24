import type { TObject } from '@utils/types';

import { getApi, postApi, putApi } from './configs';

export const getCompaniesApi = () => getApi('/admin/users/company');

export const adminUpdateCompanyApi = (body: TObject) =>
  putApi('/admin/users/company/update', body);

export const createCompanyApi = (body: TObject) =>
  postApi('/admin/users/company/create', body);

export const queryCompanyMembersApi = ({
  id,
  page = 1,
  perPage = 10,
}: {
  id: string;
  page: number;
  perPage: number;
}) => {
  return getApi(
    `/admin/users/company/${id}/members?page=${page}&perPage=${perPage}`,
  );
};

export const showCompanyApi = (id: string) =>
  getApi(`/admin/users/company/${id}`);

export const updateCompanyStatusApi = (body: TObject) =>
  putApi(`/admin/users/company/status`, body);

export const createDraftPartnerApi = (body: TObject) =>
  postApi('/admin/users/partner/create-draft', body);

export const updateRestaurantApi = (body: TObject) =>
  postApi('/admin/listings/restaurant/update', body);

export const publishDraftPartnerApi = (body: TObject) =>
  postApi('/admin/users/partner/publish-draft', body);

export const deletePartnerApi = (body: TObject) =>
  postApi('/admin/users/partner/delete-partner', body);

export const showRestaurantApi = ({ id, ...rest }: TObject) =>
  postApi(`/admin/listings/restaurant/${id}`, rest);

export const queryRestaurantListingsApi = (body: TObject) =>
  postApi('/admin/listings/restaurant/query', body);

export const updateRestaurantStatusApi = (body: TObject) =>
  postApi('/admin/listings/restaurant/status', body);

export const loadOrderDataApi = (orderId: string) =>
  getApi(`/participants/orders/${orderId}`);

export const loadPlanDataApi = (planId: string) =>
  getApi(`/participants/plans/${planId}`);

export const updateParticipantOrderApi = (orderId: string, body: TObject) =>
  postApi(`/participants/orders/${orderId}`, body);

export const fetchUserApi = (userId: string) =>
  getApi(`/users/fetch-user/${userId}`);
