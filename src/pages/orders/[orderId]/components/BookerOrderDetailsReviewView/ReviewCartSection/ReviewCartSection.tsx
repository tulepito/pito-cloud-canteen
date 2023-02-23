import Button from '@components/Button/Button';
import { parseThousandNumber } from '@helpers/format';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { orderManagementThunks } from '@pages/orders/[orderId]/OrderManagement.slice';
import { companyPaths } from '@src/paths';
import type { TObject } from '@utils/types';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import React from 'react';
import { useIntl } from 'react-intl';

import css from './ReviewCartSection.module.scss';

type TReviewCartSectionProps = {
  className?: string;
  data: TObject;
  showStartPickingOrderButton: boolean;
  onClickDownloadPriceQuotation: () => void;
};

const ReviewCartSection: React.FC<TReviewCartSectionProps> = (props) => {
  const {
    className,
    data: {
      overflow = 0,
      PITOPoints = 0,
      promotion = 0,
      serviceFee = 0,
      totalPrice = 0,
      totalWithoutVAT = 0,
      totalWithVAT = 0,
      transportFee = 0,
      // VATFee = 0,
    } = {},
    showStartPickingOrderButton,
    onClickDownloadPriceQuotation,
  } = props;
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isStartOrderInProgress = useAppSelector(
    (state) => state.OrderManagement.isStartOrderInProgress,
  );

  const {
    query: { orderId },
  } = router;
  const rootClasses = classNames(css.root, className);

  const handleStartPickingOrder = async () => {
    await dispatch(
      orderManagementThunks.bookerStartOrder({ orderId: orderId as string }),
    );

    setTimeout(() => {
      router.push({
        pathname: companyPaths.ManageOrderDetail,
        query: { orderId },
      });
    }, 1000);
  };

  return (
    <div className={rootClasses}>
      <div className={css.title}>
        {intl.formatMessage({ id: 'ReviewCardSection.title' })}
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
            </div>
            <div className={css.fee}>
              {parseThousandNumber(serviceFee.toString())}đ
            </div>
          </div>
        </div>
        <div className={css.feeItem}>
          <div className={css.feeItemContainer}>
            <div className={css.label}>
              {intl.formatMessage({ id: 'ReviewCardSection.transportFee' })}
            </div>
            <div className={css.fee}>
              {parseThousandNumber(transportFee.toString())}đ
            </div>
          </div>
        </div>
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
        {/* <div className={css.feeItem}>
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
        </div> */}
        <div className={css.feeItem}>
          <div className={css.totalWithVATLabel}>
            {intl.formatMessage({ id: 'ReviewCardSection.totalWithVAT' })}
          </div>
          <div className={css.totalWithVAT}>{totalWithVAT}đ</div>
          <div className={css.PITOPoints}>
            {intl.formatMessage(
              { id: 'ReviewCardSection.PITOPoints' },
              { PITOPoints },
            )}
          </div>
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
          onClick={handleStartPickingOrder}>
          <div>
            {intl.formatMessage({
              id: 'ReviewCardSection.makePayment',
            })}
          </div>
        </Button>
      )}

      {overflow > 0 && (
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
      )}
    </div>
  );
};

export default ReviewCartSection;
