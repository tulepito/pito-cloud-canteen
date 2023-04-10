import React from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import Badge from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { parseThousandNumber } from '@helpers/format';
import { isEnableToStartOrder } from '@helpers/orderHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { orderManagementThunks } from '@redux/slices/OrderManagement.slice';
import { companyPaths } from '@src/paths';
import { Listing } from '@utils/data';
import type { TListing, TObject } from '@utils/types';

import css from './ReviewCartSection.module.scss';

type TReviewCartSectionProps = {
  className?: string;
  data: TObject;
  showStartPickingOrderButton: boolean;
  onClickDownloadPriceQuotation: () => void;
  foodOrderGroupedByDate?: TObject[];
  title?: string;
  target: 'client' | 'partner';
};

const ReviewCartSection: React.FC<TReviewCartSectionProps> = (props) => {
  const {
    className,
    data: {
      overflow = 0,
      promotion = 0,
      serviceFee = 0,
      serviceFeePrice = 0,
      totalPrice = 0,
      totalWithoutVAT = 0,
      totalWithVAT = 0,
      // PITOPoints = 0,
      // transportFee = 0,
      VATFee = 0,
      PITOFee = 0,
    } = {},
    showStartPickingOrderButton,
    onClickDownloadPriceQuotation,
    foodOrderGroupedByDate,
    title,
    target,
  } = props;

  const intl = useIntl();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isStartOrderInProgress = useAppSelector(
    (state) => state.OrderManagement.isStartOrderInProgress,
  );
  const planData = useAppSelector((state) => state.OrderManagement.planData);

  const {
    query: { orderId },
  } = router;
  const rootClasses = classNames(css.root, className);
  const { orderDetail } = Listing(planData as TListing).getMetadata();
  const isStartOrderDisabled = !isEnableToStartOrder(orderDetail);
  const isPartner = target === 'partner';

  const handleStartPickingOrder = async () => {
    const { meta } = await dispatch(
      orderManagementThunks.bookerStartOrder({
        orderId: orderId as string,
        foodOrderGroupedByDate,
      }),
    );

    if (meta.requestStatus !== 'rejected') {
      router.push({
        pathname: companyPaths.ManageOrderDetail,
        query: { orderId },
      });
    }
  };

  return (
    <div className={rootClasses}>
      <div className={css.title}>
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
        {isPartner && (
          <div className={css.feeItem}>
            <div className={css.feeItemContainer}>
              <div className={css.label}>
                {intl.formatMessage({ id: 'ReviewCardSection.serviceFee' })}
                <Badge label={`${serviceFee}%`} className={css.VATBadge} />
              </div>
              <div className={css.fee}>
                {parseThousandNumber(serviceFeePrice.toString())}đ
              </div>
            </div>
          </div>
        )}
        {!isPartner && (
          <div className={css.feeItem}>
            <div className={css.feeItemContainer}>
              <div className={css.label}>
                {intl.formatMessage({ id: 'ReviewCardSection.PITOFee' })}
              </div>
              <div className={css.fee}>
                {parseThousandNumber(PITOFee.toString())}đ
              </div>
            </div>
          </div>
        )}
        <div className={css.feeItem}>
          <div className={css.feeItemContainer}>
            <div className={css.label}>
              {intl.formatMessage({ id: 'ReviewCardSection.promotion' })}
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
              <Badge label="10%" className={css.VATBadge} />
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
          {/* <div className={css.PITOPoints}>
            {intl.formatMessage(
              { id: 'ReviewCardSection.PITOPoints' },
              { PITOPoints },
            )}
          </div> */}
          <div className={css.totalDescription}>
            {intl.formatMessage({ id: 'ReviewCardSection.totalDescription' })}
          </div>
        </div>
      </div>

      <div
        className={css.downloadPriceQuotation}
        onClick={onClickDownloadPriceQuotation}>
        {intl.formatMessage({
          id: 'ReviewCardSection.downloadPriceQuotation',
        })}
      </div>

      {showStartPickingOrderButton && (
        <Button
          variant="cta"
          className={css.makePaymentButton}
          inProgress={isStartOrderInProgress}
          disabled={isStartOrderDisabled}
          onClick={handleStartPickingOrder}>
          <div>
            {intl.formatMessage({
              id: 'ReviewCardSection.makePayment',
            })}
          </div>
        </Button>
      )}

      <RenderWhen condition={overflow > 0}>
        <div className={css.overflowPackageInfo}>
          {intl.formatMessage(
            {
              id: 'ReviewCardSection.overflowPackage',
            },
            {
              overflow: parseThousandNumber(overflow.toString()),
            },
          )}
        </div>
      </RenderWhen>
    </div>
  );
};

export default ReviewCartSection;
