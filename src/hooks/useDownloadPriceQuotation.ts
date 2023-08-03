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
}: {
  orderTitle: string;
  priceQuotationData: ReturnType<
    typeof usePrepareOrderDetailPageData
  >['priceQuotationData'];
  isPartnerQuotation?: boolean;
}) => {
  const dispatch = useAppDispatch();

  const downloadPriceQuotation = useCallback(async () => {
    try {
      dispatch(priceQuotationActions.startDownloading());
      dispatch(UIActions.disableScrollRequest('priceQuotation'));
      await downloadPriceQuotationFn({
        orderTitle,
        priceQuotationData,
        isPartnerQuotation,
      })();
      dispatch(priceQuotationActions.endDownloading());
      dispatch(UIActions.disableScrollRemove('priceQuotation'));
    } catch (error) {
      console.error(
        '💫 > file: useDownloadPriceQuotation.ts:27 > downloadPriceQuotation > error: ',
        error,
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderTitle, JSON.stringify(priceQuotationData)]);

  return downloadPriceQuotation;
};
