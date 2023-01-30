import type { TObject } from '@utils/types';

import type { TBodyParams } from './configs';
import { postApi } from './configs';

export const showPartnerFoodApi = (id: string, queryParams: TObject) => {
  return postApi(`/api/admin/listings/foods/${id}`, queryParams);
};

export const createPartnerFoodApi = (body: TBodyParams) => {
  return postApi(`/api/admin/listings/foods/create`, body);
};

export const updatePartnerFoodApi = (body: TBodyParams) => {
  return postApi(`/api/admin/listings/foods/update`, body);
};

export const deletePartnerFoodApi = (body: TBodyParams) => {
  return postApi(`/api/admin/listings/foods/delete`, body);
};
