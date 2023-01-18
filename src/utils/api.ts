import axios from 'axios';

export const apiBaseUrl = () => {
  const port = process.env.NEXT_PORT || 3000;
  const useDevApiServer =
    process.env.NEXT_PUBLIC_ENV === 'development' && !!port;

  // In development, the dev API server is running in a different port
  if (useDevApiServer) {
    return `http://localhost:${port}`;
  }

  // Otherwise, use the same domain and port as the frontend
  return `${window.location.origin}`;
};

export const get = (path: string) => {
  return axios.get(`${apiBaseUrl()}${path}`);
};

export const post = (path: string, body: any) => {
  return axios.post(`${apiBaseUrl()}${path}`, body);
};

export const put = (path: string, body: any) => {
  return axios.put(`${apiBaseUrl()}${path}`, body);
};

export const deleteMethod = (path: string, body: any) => {
  return axios.delete(`${apiBaseUrl()}${path}`, body);
};

export const getCompaniesApi = () => get('/api/admin/users/company');

export const updateCompanyApi = (body: any) =>
  put('/api/admin/users/company/update', body);

export const createCompanyApi = (body: any) =>
  post('/api/admin/users/company/create', body);

export const showCompanyApi = (id: string) =>
  get(`/api/admin/users/company/${id}`);

export const updateCompanyStatusApi = (body: any) =>
  put(`/api/admin/users/company/status`, body);

export const createDraftPartnerApi = (body: any) =>
  post('/api/admin/users/partner/create-draft', body);

export const updateRestaurantApi = (body: any) =>
  post('/api/admin/listings/restaurant/update', body);

export const publishDraftPartnerApi = (body: any) =>
  post('/api/admin/users/partner/publish-draft', body);

export const deletePartnerApi = (body: any) =>
  post('/api/admin/users/partner/delete-partner', body);

export const showRestaurantApi = ({ id, ...rest }: any) =>
  post(`/api/admin/listings/restaurant/${id}`, rest);

export const queryRestaurantListingsApi = (body: any) =>
  post('/api/admin/listings/restaurant/query', body);

export const updateRestaurantStatusApi = (body: any) =>
  post('/api/admin/listings/restaurant/status', body);

export const loadOrderDataApi = (orderId: string) =>
  get(`/api/participants/orders/${orderId}`);

export const loadPlanDataApi = (planId: string) =>
  get(`/api/participants/plans/${planId}`);

export const updateParticipantOrderApi = (orderId: string, body: any) =>
  post(`/api/participants/orders/${orderId}`, body);

export const fetchUserApi = (userId: string) =>
  get(`/api/users/fetch-user/${userId}`);
