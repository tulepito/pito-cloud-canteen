import type { TObject } from '@src/utils/types';

import { deleteApi, getApi, postApi, putApi } from './configs';

export const getAttributesApi = () => getApi('/admin/filters');
export const addAttributesApi = (body: TObject) =>
  postApi('/admin/filters', body);
export const updateAttributesApi = (body: TObject) =>
  putApi('/admin/filters', body);
export const deleteAttributesApi = (body: TObject) =>
  deleteApi('/admin/filters', body);
