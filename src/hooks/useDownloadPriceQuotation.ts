/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback } from 'react';

import { downloadPriceQuotation as downloadPriceQuotationFn } from '@helpers/order/downloadPriceQuotationHelper';
import { priceQuotationActions } from '@redux/slices/priceQuotation.slice';
import { UIActions } from '@redux/slices/UI.slice';
import { EPartnerVATSetting } from '@src/utils/enums';

import { useAppDispatch } from './reduxHooks';
import type { usePrepareOrderDetailPageData } from './usePrepareOrderManagementData';

export const useDownloadPriceQuotation = ({
  orderTitle,
  priceQuotationData,
  isPartnerQuotation = false,
  subOrderDate,
  vatSetting = EPartnerVATSetting.vat,
}: {
  orderTitle: string;
  priceQuotationData: ReturnType<
    typeof usePrepareOrderDetailPageData
  >['priceQuotationData'];
  isPartnerQuotation?: boolean;
  subOrderDate?: number | string;
  vatSetting?: EPartnerVATSetting;
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
        subOrderDate,
        vatSetting,
      })();
      dispatch(priceQuotationActions.endDownloading());
      dispatch(UIActions.disableScrollRemove('priceQuotation'));
    } catch (error) {
      console.error('💫 > downloadPriceQuotation > error: ', error);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    orderTitle,
    JSON.stringify(priceQuotationData),
    subOrderDate,
    isPartnerQuotation,
    vatSetting,
  ]);

  return downloadPriceQuotation;
};
