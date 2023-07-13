import React from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import Badge from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import { parseThousandNumber } from '@helpers/format';
import { calculatePriceQuotationInfo } from '@helpers/order/cartInfoHelper';
import { useAppSelector } from '@hooks/reduxHooks';
import { useDownloadPriceQuotation } from '@hooks/useDownloadPriceQuotation';
import { usePrepareOrderDetailPageData } from '@hooks/usePrepareOrderManagementData';
import { CurrentUser, Listing } from '@src/utils/data';
import type { TListing } from '@utils/types';

import css from './SubOrderCart.module.scss';

type TSubOrderCartProps = {
  className?: string;
  onClickDownloadPriceQuotation?: () => void;
  title?: string;
};

const SubOrderCart: React.FC<TSubOrderCartProps> = (props) => {
  const { className, title } = props;

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
  const { orderVATPercentage = 0, serviceFees: serviceFeePercentageMap = {} } =
    orderGetter.getMetadata();
  const { orderDetail: planOrderDetail = {} } = planGetter.getMetadata();
  const serviceFeePercentage =
    serviceFeePercentageMap[restaurantListingId] || 0;

  const {
    promotion = 0,
    serviceFee = 0,
    totalPrice = 0,
    totalWithoutVAT = 0,
    totalWithVAT = 0,
    VATFee = 0,
  } = calculatePriceQuotationInfo({
    planOrderDetail,
    order,
    currentOrderVATPercentage: orderVATPercentage,
    currentOrderServiceFeePercentage: serviceFeePercentage / 100,
    date,
    shouldIncludePITOFee: false,
  });

  const { orderTitle, priceQuotationData } = usePrepareOrderDetailPageData({
    date,
    VATPercentage: orderVATPercentage,
  });

  const handleDownloadPriceQuotation = useDownloadPriceQuotation(
    orderTitle,
    priceQuotationData,
  );
  const rootClasses = classNames(css.root, className);
  const titleClasses = classNames(css.title, {});
  const downloadPriceQuotationClasses = classNames(css.downloadPriceQuotation, {
    [css.downloadingPriceQuotation]: isDownloadingPriceQuotation,
  });

  return (
    <div className={rootClasses}>
      <div className={titleClasses}>
        {title || intl.formatMessage({ id: 'ReviewCardSection.title' })}
      </div>

      <div className={css.feeContainer}>
        <div className={css.feeItem}>
          <div className={css.feeItemContainer}>
            <div className={css.label}>
              {intl.formatMessage({ id: 'ReviewCardSection.totalPrice' })}
            </div>
            <div className={css.fee}>
              {parseThousandNumber(totalPrice.toString())}đ
            </div>
          </div>
        </div>

        <div className={css.feeItem}>
          <div className={css.feeItemContainer}>
            <div className={css.label}>
              {intl.formatMessage({ id: 'ReviewCardSection.serviceFee' })}
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
                id: 'ReviewCardSection.promotion',
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
              {intl.formatMessage({ id: 'ReviewCardSection.totalWithoutVAT' })}
            </div>

            <div className={css.fee}>
              {parseThousandNumber(totalWithoutVAT.toString())}đ
            </div>
          </div>
        </div>
        <div className={css.feeItem}>
          <div
            className={classNames(css.feeItemContainer, css.VATItemContainer)}>
            <div className={css.label}>
              {intl.formatMessage({ id: 'ReviewCardSection.VAT' })}
              <Badge
                label={`${Math.round(orderVATPercentage * 100)}%`}
                className={css.VATBadge}
              />
            </div>
            <div className={css.fee}>
              {parseThousandNumber(VATFee.toString())}đ
            </div>
          </div>
        </div>
        <div className={css.feeItem}>
          <div className={css.totalWithVATLabel}>
            {intl.formatMessage({ id: 'ReviewCardSection.totalWithVAT' })}
          </div>
          <div className={css.totalWithVAT}>
            {parseThousandNumber(totalWithVAT.toString())}đ
          </div>

          <div className={css.totalDescription}>
            {intl.formatMessage({ id: 'ReviewCardSection.totalDescription' })}
          </div>
        </div>
      </div>

      <Button
        variant="inline"
        className={downloadPriceQuotationClasses}
        disabled={isDownloadingPriceQuotation}
        onClick={handleDownloadPriceQuotation}>
        {intl.formatMessage({
          id: 'ReviewCardSection.downloadPriceQuotation',
        })}
      </Button>
    </div>
  );
};

export default SubOrderCart;
