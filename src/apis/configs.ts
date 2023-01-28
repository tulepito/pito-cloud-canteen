import type { TObject } from '@utils/types';
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

export const getApi = (path: string) => {
  return axios.get(`${apiBaseUrl()}${path}`);
};

export const postApi = (path: string, body: TObject) => {
  return axios.post(`${apiBaseUrl()}${path}`, body);
};

export const putApi = (path: string, body: TObject) => {
  return axios.put(`${apiBaseUrl()}${path}`, body);
};

export const deleteApi = (path: string, body: TObject) => {
  return axios.delete(`${apiBaseUrl()}${path}`, body);
};
