import { getApi } from './configs';

export const queryMyCompaniesApi = () => getApi('/users/my-companies');

export const fetchSearchFilterApi = () => getApi('/search-filters');

export const disableWalkthroughApi = (userId: string) =>
  getApi(`/users/disable-walkthrough/${userId}`);
