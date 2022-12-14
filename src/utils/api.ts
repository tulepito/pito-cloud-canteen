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

export const getCompaniesApi = () => get('/api/users');

export const updateCompany = (body: any) => put('/api/users/update', body);

export const createCompany = (body: any) => post('/api/users/create', body);
