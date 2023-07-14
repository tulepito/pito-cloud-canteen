import { getApi } from './configs';

export const fetchTxApi = (txId: string) => getApi(`/transactions/${txId}`);

export const queryTransactionApi = (body: any) =>
  getApi('/transactions/query-transactions', body);
