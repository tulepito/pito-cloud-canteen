import type { TObject } from '@utils/types';

import { getApi, postApi, putApi } from './configs';

export const getCompaniesApi = () => getApi('/api/admin/users/company');

export const updateCompanyApi = (body: TObject) =>
  putApi('/api/admin/users/company/update', body);

export const createCompanyApi = (body: TObject) =>
  postApi('/api/admin/users/company/create', body);

export const showCompanyApi = (id: string) =>
  getApi(`/api/admin/users/company/${id}`);

export const updateCompanyStatusApi = (body: TObject) =>
  putApi(`/api/admin/users/company/status`, body);

export const createDraftPartnerApi = (body: TObject) =>
  postApi('/api/admin/users/partner/create-draft', body);

export const updateRestaurantApi = (body: TObject) =>
  postApi('/api/admin/listings/restaurant/update', body);

export const publishDraftPartnerApi = (body: TObject) =>
  postApi('/api/admin/users/partner/publish-draft', body);

export const deletePartnerApi = (body: TObject) =>
  postApi('/api/admin/users/partner/delete-partner', body);

export const showRestaurantApi = ({ id, ...rest }: TObject) =>
  postApi(`/api/admin/listings/restaurant/${id}`, rest);

export const queryRestaurantListingsApi = (body: TObject) =>
  postApi('/api/admin/listings/restaurant/query', body);

export const updateRestaurantStatusApi = (body: TObject) =>
  postApi('/api/admin/listings/restaurant/status', body);

export const loadOrderDataApi = (orderId: string) =>
  getApi(`/api/participants/orders/${orderId}`);

export const loadPlanDataApi = (planId: string) =>
  getApi(`/api/participants/plans/${planId}`);

export const updateParticipantOrderApi = (orderId: string, body: TObject) =>
  postApi(`/api/participants/orders/${orderId}`, body);

export const fetchUserApi = (userId: string) =>
  getApi(`/api/users/fetch-user/${userId}`);
