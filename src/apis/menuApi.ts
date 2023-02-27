import type { TCheckUnConflictedParams } from '@helpers/apiHelpers';
import type { TObject } from '@utils/types';

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

export const showPartnerMenuApi = (id: string, queryParams: TObject) => {
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

export const checkMenuUnConflictedApi = (body: TCheckUnConflictedParams) =>
  postApi(`/admin/listings/menus/isUnConflicted`, body);
