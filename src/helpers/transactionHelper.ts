import { txIsCompleted, txIsReviewed } from '@utils/transaction';
import type { TTransaction } from '@utils/types';

export const countCompletedTransactions = (transactions: TTransaction[]) => {
  return transactions.filter(
    (transaction) => txIsCompleted(transaction) || txIsReviewed(transaction),
  ).length;
};
