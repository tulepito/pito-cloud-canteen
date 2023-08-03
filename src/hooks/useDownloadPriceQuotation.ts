/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback } from 'react';

import { downloadPriceQuotation as downloadPriceQuotationFn } from '@helpers/order/downloadPriceQuotationHelper';
import { priceQuotationActions } from '@redux/slices/priceQuotation.slice';
import { UIActions } from '@redux/slices/UI.slice';

import { useAppDispatch } from './reduxHooks';
import type { usePrepareOrderDetailPageData } from './usePrepareOrderManagementData';

export const useDownloadPriceQuotation = ({
  orderTitle,
  priceQuotationData,
  isPartnerQuotation = false,
  subOrderDate,
}: {
  orderTitle: string;
  priceQuotationData: ReturnType<
    typeof usePrepareOrderDetailPageData
  >['priceQuotationData'];
  isPartnerQuotation?: boolean;
  subOrderDate?: number | string;
}) => {
  const dispatch = useAppDispatch();

  const downloadPriceQuotation = useCallback(async () => {
    dispatch(priceQuotationActions.startDownloading());
    dispatch(UIActions.disableScrollRequest('priceQuotation'));
    await downloadPriceQuotationFn({
      orderTitle,
      priceQuotationData,
      isPartnerQuotation,
      subOrderDate,
    })();
    dispatch(priceQuotationActions.endDownloading());
    dispatch(UIActions.disableScrollRemove('priceQuotation'));
  }, [
    orderTitle,
    JSON.stringify(priceQuotationData),
    subOrderDate,
    isPartnerQuotation,
  ]);

  return downloadPriceQuotation;
};
