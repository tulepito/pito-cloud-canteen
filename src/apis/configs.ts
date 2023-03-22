import axios from 'axios';
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

import cookies from '@services/cookie';
import type { TObject } from '@utils/types';

export const apiBaseUrl = () => {
  const port = process.env.NEXT_PUBLIC_PORT || 3000;
  const useDevApiServer =
    (process.env.NODE_ENV === 'development' ||
      process.env.ENVIRONMENT === 'development') &&
    !!port;

  // In development, the dev API server is running in a different port
  if (useDevApiServer) {
    return `http://localhost:${port}/api`;
  }

  // Otherwise, use the same domain and port as the frontend
  return `${window.location.origin}/api`;
};

export const getApi = (path: string, params: TObject = {}) => {
  // get 'JSONParams' in req.query, remember using JSON.parse()
  // to convert JSONParams into params

  return axios.get(`${apiBaseUrl()}${path}`, {
    ...(params ? { params: { JSONParams: JSON.stringify(params) } } : {}),
  });
};

export const postApi = (path: string, body: TObject = {}) => {
  return axios.post(`${apiBaseUrl()}${path}`, body);
};

export const putApi = (path: string, body: TObject = {}) => {
  return axios.put(`${apiBaseUrl()}${path}`, body);
};

export const deleteApi = (path: string, data: TObject = {}) => {
  // get any keys of data in req.body
  return axios.delete(`${apiBaseUrl()}${path}`, { data });
};

export type TBodyParams = {
  dataParams: TObject;
  queryParams: TObject;
};

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  OPTIONS = 'OPTIONS',
}

type TApiCheckerFunction = (
  handler: NextApiHandler,
) => (req: NextApiRequest, res: NextApiResponse) => Promise<unknown> | void;

export const composeApiCheckers =
  (...checkers: TApiCheckerFunction[]) =>
  (handler: NextApiHandler) => {
    const handlerWithCookies = cookies(handler);

    checkers.forEach((checker) => checker(handlerWithCookies));

    return handlerWithCookies;
  };
