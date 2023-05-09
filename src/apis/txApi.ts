import { getApi } from './configs';

export const fetchTxApi = (txId: string) => getApi(`/transactions/${txId}`);
