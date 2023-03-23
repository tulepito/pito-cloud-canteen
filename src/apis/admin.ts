import { deleteApi, getApi, postApi, putApi } from './configs';

export const getAttributesApi = () => getApi('/admin/filters');
export const addAttributesApi = (body: any) => postApi('/admin/filters', body);
export const updateAttributesApi = (body: any) =>
  putApi('/admin/filters', body);
export const deleteAttributesApi = (body: any) =>
  deleteApi('/admin/filters', body);
