import { getApi } from './configs';

export const checkUserExistedApi = ({
  email,
  id,
}: {
  email?: string;
  id?: string;
}) => getApi(`/users/check-user-existed/`, { email, id });

export const queryMyCompaniesApi = () => getApi('/users/my-companies');

export const fetchSearchFilterApi = () => getApi('/search-filters');

export const disableWalkthroughApi = (userId: string) =>
  getApi(`/users/disable-walkthrough/${userId}`);
