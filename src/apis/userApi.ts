import { getApi } from './configs';

export const queryMyCompaniesApi = () => getApi('/users/my-companies');

export const fetchSearchFilterApi = () => getApi('/admin/filters');
