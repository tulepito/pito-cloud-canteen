/* eslint-disable max-classes-per-file */
import type { NextApiResponse } from 'next';

import type { TPagination } from './types';

export enum MessageCode {
  OK = '20000',
  CREATED = '20001',
  FAILED = '20002',
  BAD_REQUEST = '40000',
  NOT_FOUND = '40004',
  FORBIDDEN = '40003',
  CONFLICT = '40009',
  INTERNAL_SERVER_ERROR = '50000',
  UNAUTHORIZED = '40100',
  MOVED_PERMANENTLY = '30100',
}

export type ApiResponse<T = any> = {
  status: number;
  statusCode: number;
  msgcode: string;
  message?: string;
  data?: T | null;
  pagination?: TPagination;
};

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  MOVED_PERMANENTLY = 301,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

const defaultMsgcode = (status: number): string => {
  if (status >= 200 && status < 300) return MessageCode.OK;
  if (status === 400) return MessageCode.BAD_REQUEST;
  if (status === 401) return MessageCode.UNAUTHORIZED;
  if (status === 403) return MessageCode.FORBIDDEN;
  if (status === 404) return MessageCode.NOT_FOUND;
  if (status === 409) return MessageCode.CONFLICT;
  if (status >= 500) return MessageCode.INTERNAL_SERVER_ERROR;

  return MessageCode.FAILED;
};

export class ResponseFactory<T = any> {
  public status: number;

  public statusCode: number;

  public msgcode: string;

  public message?: string;

  constructor({
    status,
    message,
    msgcode,
  }: {
    status: number;
    message?: string;
    msgcode?: string;
  }) {
    this.status = status;
    this.statusCode = status;
    this.msgcode = msgcode ?? defaultMsgcode(status);
    this.message = message ?? '';
  }

  public send(res: NextApiResponse) {
    const body: ApiResponse<T> = {
      ...this,
    };

    return res.status(this.statusCode).json(body);
  }
}

export class SuccessResponse<T = any> extends ResponseFactory {
  public data?: T | null;

  public pagination?: TPagination;

  constructor({
    data,
    pagination,
    status = HttpStatus.OK,
    message,
    msgcode,
  }: {
    data?: T | null;
    pagination?: TPagination;
    status?: number;
    message?: string;
    msgcode?: string;
  }) {
    super({ status, message, msgcode });
    this.data = data ?? null;
    this.pagination = pagination;
  }
}

export class FailedResponse extends ResponseFactory {
  public error?: string;

  constructor({
    error,
    message,
    msgcode,
    status = HttpStatus.INTERNAL_SERVER_ERROR,
  }: {
    error?: string;
    msgcode?: string;
    status?: number;
    message?: string;
  }) {
    super({ status, message, msgcode });
    this.error = error;
  }
}

export default Response;
