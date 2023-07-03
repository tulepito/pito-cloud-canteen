import React from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import Badge from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import { parseThousandNumber } from '@helpers/format';
import { useAppSelector } from '@hooks/reduxHooks';
import type { TObject } from '@utils/types';

import css from './SubOrderCart.module.scss';

type TSubOrderCartProps = {
  className?: string;
  data?: TObject;
  onClickDownloadPriceQuotation?: () => void;
  title?: string;
};

const SubOrderCart: React.FC<TSubOrderCartProps> = (props) => {
  const {
    className,
    data: {
      promotion = 0,
      serviceFee = 0,
      serviceFeePrice = 0,
      totalPrice = 0,
      totalWithoutVAT = 0,
      totalWithVAT = 0,
      VATFee = 0,
    } = {},
    onClickDownloadPriceQuotation,
    title,
  } = props;

  const intl = useIntl();

  const isDownloadingPriceQuotation = useAppSelector(
    (state) => state.priceQuotation.isDownloading,
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
              <Badge label={`${serviceFee}%`} className={css.VATBadge} />
            </div>
            <div className={css.fee}>
              {parseThousandNumber(serviceFeePrice.toString())}đ
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

          <div className={css.totalDescription}>
            {intl.formatMessage({ id: 'ReviewCardSection.totalDescription' })}
          </div>
        </div>
      </div>

      <Button
        variant="inline"
        className={downloadPriceQuotationClasses}
        disabled={isDownloadingPriceQuotation}
        onClick={onClickDownloadPriceQuotation}>
        {intl.formatMessage({
          id: 'ReviewCardSection.downloadPriceQuotation',
        })}
      </Button>
    </div>
  );
};

export default SubOrderCart;
