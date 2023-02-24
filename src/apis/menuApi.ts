import type { TCheckUnconflictedParams } from '@helpers/apiHelpers';

import type { TBodyParams } from './configs';
import { getApi, postApi } from './configs';

export const createPartnerMenuApi = (body: TBodyParams) => {
  return postApi(`/admin/listings/menus/create`, body);
};

export const updatePartnerMenuApi = (body: TBodyParams) => {
  return postApi(`/admin/listings/menus/update`, body);
};

export const deletePartnerMenuApi = (body: TBodyParams) => {
  return postApi(`/admin/listings/menus/delete`, body);
};

export const showPartnerMenuApi = (
  id: string,
  queryParams: Record<any, any>,
) => {
  return postApi(`/admin/listings/menus/${id}`, queryParams);
};

export const queryAllMenusApi = ({
  restaurantId,
}: {
  restaurantId: string;
}) => {
  return postApi(`/admin/listings/menus/queryAll`, { restaurantId });
};

export const checkMenuInTransactionProgressApi = (id: string) => {
  return getApi(`/admin/listings/menus/${id}/isInTransactionProgress`);
};

export const checkMenuUnconflictedApi = (body: TCheckUnconflictedParams) =>
  postApi(`/admin/listings/menus/isUnconflicted`, body);
