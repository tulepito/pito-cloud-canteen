/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import Badge from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { parseThousandNumber } from '@helpers/format';
import { calculatePriceQuotationInfoFromOrder } from '@helpers/order/cartInfoHelper';
import { ensureVATSetting } from '@helpers/order/prepareDataHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { useDownloadPriceQuotation } from '@hooks/useDownloadPriceQuotation';
import { usePrepareOrderDetailPageData } from '@hooks/usePrepareOrderManagementData';
import { orderManagementThunks } from '@redux/slices/OrderManagement.slice';
import { CurrentUser, Listing } from '@src/utils/data';
import type { TListing } from '@utils/types';

import css from './SubOrderCart.module.scss';

type TSubOrderCartProps = {
  className?: string;
  onClickDownloadPriceQuotation?: () => void;
  title?: string;
  inProgress: boolean;
};

const SubOrderCart: React.FC<TSubOrderCartProps> = (props) => {
  const { className, title, inProgress } = props;
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const router = useRouter();
  const order = useAppSelector((state) => state.PartnerSubOrderDetail.order);
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const isDownloadingPriceQuotation = useAppSelector(
    (state) => state.priceQuotation.isDownloading,
  );

  const {
    query: { subOrderId = '' },
  } = router;

  // eslint-disable-next-line no-unsafe-optional-chaining
  const [, date] = (subOrderId as string)?.split('_');
  const { restaurantListingId } = CurrentUser(currentUser!).getMetadata();
  const { plan } = order;

  const orderGetter = Listing(order as TListing);
  const planGetter = Listing(plan as TListing);
  const {
    orderVATPercentage = 0,
    serviceFees: serviceFeePercentageMap = {},
    quotationId,
    vatSettings = {},
  } = orderGetter.getMetadata();
  const orderId = orderGetter.getId();
  const { orderDetail: planOrderDetail = {} } = planGetter.getMetadata();
  const serviceFeePercentage =
    serviceFeePercentageMap[restaurantListingId] || 0;
  const vatSetting = ensureVATSetting(vatSettings[restaurantListingId]);

  const {
    promotion = 0,
    serviceFee = 0,
    totalPrice = 0,
    totalWithoutVAT = 0,
    totalWithVAT = 0,
    VATFee = 0,
    vatPercentage,
  } = calculatePriceQuotationInfoFromOrder({
    planOrderDetail,
    order,
    orderVATPercentage,
    orderServiceFeePercentage: serviceFeePercentage / 100,
    date,
    shouldIncludePITOFee: false,
    vatSetting,
    isPartner: true,
  });

  const { orderTitle, priceQuotationData } = usePrepareOrderDetailPageData({
    date,
    partnerId: restaurantListingId,
    VATPercentage: orderVATPercentage,
    serviceFeePercentage: serviceFeePercentage / 100,
    isPartner: true,
    vatSetting,
  });
  const handleDownloadPriceQuotation = useDownloadPriceQuotation({
    orderTitle,
    priceQuotationData,
    isPartnerQuotation: true,
    vatSetting,
    subOrderDate: date,
  });
  const rootClasses = classNames(css.root, className);
  const titleClasses = classNames(css.title, {});
  const downloadPriceQuotationClasses = classNames(css.downloadPriceQuotation, {
    [css.downloadingPriceQuotation]: isDownloadingPriceQuotation,
  });

  useEffect(() => {
    if (quotationId) {
      dispatch(orderManagementThunks.fetchQuotation(quotationId));
    }
  }, [quotationId]);
  useEffect(() => {
    if (orderId) {
      dispatch(
        orderManagementThunks.loadData({
          orderId: orderId as string,
        }),
      );
    }
  }, [orderId]);

  return (
    <div className={rootClasses}>
      <div className={titleClasses}>
        {title || intl.formatMessage({ id: 'SubOrderCart.title' })}
      </div>

      <RenderWhen condition={!inProgress}>
        <div className={css.inforWrapper}>
          <div className={css.feeContainer}>
            <div className={css.feeItem}>
              <div className={css.feeItemContainer}>
                <div className={css.label}>
                  {intl.formatMessage({ id: 'SubOrderCart.totalPrice' })}
                </div>
                <div className={css.fee}>
                  {parseThousandNumber(totalPrice.toString())}đ
                </div>
              </div>
            </div>

            <div className={css.feeItem}>
              <div className={css.feeItemContainer}>
                <div className={css.label}>
                  {intl.formatMessage({ id: 'SubOrderCart.serviceFee' })}
                  <Badge
                    label={`${serviceFeePercentage}%`}
                    className={css.VATBadge}
                  />
                </div>
                <div className={css.fee}>
                  {parseThousandNumber(serviceFee.toString())}đ
                </div>
              </div>
            </div>

            <div className={css.feeItem}>
              <div className={css.feeItemContainer}>
                <div className={css.label}>
                  {intl.formatMessage({
                    id: 'SubOrderCart.promotion',
                  })}
                </div>
                <div className={css.fee}>
                  {parseThousandNumber(promotion.toString())}đ
                </div>
              </div>
            </div>
            <div className={css.feeItem}>
              <div className={css.feeItemContainer}>
                <div className={css.totalWithoutVATLabel}>
                  {intl.formatMessage({ id: 'SubOrderCart.totalWithoutVAT' })}
                </div>

                <div className={css.fee}>
                  {parseThousandNumber(totalWithoutVAT.toString())}đ
                </div>
              </div>
            </div>
            <div className={css.feeItem}>
              <div
                className={classNames(
                  css.feeItemContainer,
                  css.VATItemContainer,
                )}>
                <div className={css.label}>
                  {intl.formatMessage({ id: 'SubOrderCart.VAT' })}
                  <Badge
                    label={`${Math.round(vatPercentage * 100)}%`}
                    className={css.VATBadge}
                  />
                </div>
                <div className={css.fee}>
                  {parseThousandNumber(VATFee.toString())}đ
                </div>
              </div>
            </div>
            <div className={css.totalPrice}>
              <div className={css.totalWithVATLabel}>
                {intl.formatMessage({ id: 'SubOrderCart.totalWithVAT' })}
              </div>
              <div className={css.priceWrapper}>
                <div className={css.totalWithVAT}>
                  {parseThousandNumber(totalWithVAT.toString())}đ
                </div>

                <div className={css.totalDescription}>
                  {intl.formatMessage({ id: 'SubOrderCart.totalDescription' })}
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="inline"
            className={downloadPriceQuotationClasses}
            disabled={isDownloadingPriceQuotation}
            onClick={handleDownloadPriceQuotation}>
            {intl.formatMessage({
              id: 'SubOrderCart.downloadPriceQuotation',
            })}
          </Button>
        </div>
        <RenderWhen.False>
          <Skeleton className={css.loading} />
        </RenderWhen.False>
      </RenderWhen>
    </div>
  );
};

export default SubOrderCart;
