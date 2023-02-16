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

export const queryAllMenusApi = (body: TBodyParams) => {
  return postApi(`/admin/listings/menus/queryAll`, body);
};

export const checkMenuInTransactionProgressApi = (id: string) => {
  return getApi(`/admin/listings/menus/${id}/isInTransactionProgress`);
};
