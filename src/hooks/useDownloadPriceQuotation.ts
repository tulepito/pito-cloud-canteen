import { useCallback } from 'react';

import { downloadPriceQuotation as downloadPriceQuotationFn } from '@helpers/order/downloadPriceQuotationHelper';
import { priceQuotationActions } from '@redux/slices/priceQuotation.slice';
import { UIActions } from '@redux/slices/UI.slice';

import { useAppDispatch } from './reduxHooks';
import type { usePrepareOrderDetailPageData } from './usePrepareOrderManagementData';

export const useDownloadPriceQuotation = (
  orderTitle: string,
  priceQuotationData: ReturnType<
    typeof usePrepareOrderDetailPageData
  >['priceQuotationData'],
) => {
  const dispatch = useAppDispatch();

  const downloadPriceQuotation = useCallback(async () => {
    dispatch(priceQuotationActions.startDownloading());
    dispatch(UIActions.disableScrollRequest('priceQuotation'));
    await downloadPriceQuotationFn(orderTitle, priceQuotationData)();
    dispatch(priceQuotationActions.endDownloading());
    dispatch(UIActions.disableScrollRemove('priceQuotation'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderTitle, JSON.stringify(priceQuotationData)]);

  return downloadPriceQuotation;
};
