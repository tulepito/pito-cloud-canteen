import Badge from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import { parseThousandNumber } from '@helpers/format';
import { EParticipantOrderStatus } from '@utils/enums';
import type { TObject } from '@utils/types';
import classNames from 'classnames';
import React from 'react';
import { useIntl } from 'react-intl';

import css from './ReviewCartSection.module.scss';

const calculateTotalPriceAndDishes = ({
  orderDetail = {},
}: {
  orderDetail: TObject;
}) => {
  return Object.entries(orderDetail).reduce(
    (result, currentOrderDetailEntry) => {
      const [, rawOrderDetailOfDate] = currentOrderDetailEntry;

      const { memberOrders, foodList: foodListOfDate } =
        rawOrderDetailOfDate as TObject;

      const foodDataMap = Object.entries(memberOrders).reduce(
        (foodFrequencyResult, currentMemberOrderEntry) => {
          const [, memberOrderData] = currentMemberOrderEntry;
          const { foodId, status } = memberOrderData as TObject;
          const { foodName, foodPrice } = foodListOfDate[foodId];

          if (status === EParticipantOrderStatus.joined && foodId !== '') {
            const data = foodFrequencyResult[foodId] as TObject;
            const { frequency } = data || {};

            return {
              ...foodFrequencyResult,
              [foodId]: data
                ? { ...data, frequency: frequency + 1 }
                : { foodId, foodName, foodPrice, frequency: 1 },
            };
          }

          return foodFrequencyResult;
        },
        {} as TObject,
      );

      const foodDataList = Object.values(foodDataMap);
      const totalInfo = foodDataList.reduce(
        (previousResult: TObject, current: TObject) => {
          const { totalPrice, totalDishes } = previousResult;

          const { frequency, foodPrice } = current;
          return {
            ...previousResult,
            totalDishes: totalDishes + frequency,
            totalPrice: totalPrice + foodPrice * frequency,
          };
        },
        {
          totalDishes: 0,
          totalPrice: 0,
        } as TObject,
      );

      return {
        ...result,
        totalPrice: result.totalPrice + totalInfo.totalPrice,
        totalDishes: result.totalDishes + totalInfo.totalDishes,
      };
    },
    {
      totalDishes: 0,
      totalPrice: 0,
    } as TObject,
  );
};

type TReviewCartSectionProps = {
  className?: string;
  data: { orderDetail: TObject; packagePerMember: number };
};

const ReviewCartSection: React.FC<TReviewCartSectionProps> = (props) => {
  const { className, data: { orderDetail = {}, packagePerMember = 0 } = {} } =
    props;
  const intl = useIntl();

  const rootClasses = classNames(css.root, className);

  const totalInfo = calculateTotalPriceAndDishes({ orderDetail });
  const { totalPrice = 0, totalDishes = 0 } = totalInfo || {};

  const PITOPoints = totalPrice / 100000;

  const isOverflowPackage = totalDishes * packagePerMember < totalPrice;
  const overflow = isOverflowPackage
    ? totalPrice - totalDishes * packagePerMember
    : 0;

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
            <div className={css.fee}>0đ</div>
          </div>
        </div>
        <div className={css.feeItem}>
          <div className={css.feeItemContainer}>
            <div className={css.label}>
              {intl.formatMessage({ id: 'ReviewCardSection.serviceFee' })}
            </div>
            <div className={css.fee}>0đ</div>
          </div>
        </div>
        <div className={css.feeItem}>
          <div className={css.feeItemContainer}>
            <div className={css.label}>
              {intl.formatMessage({ id: 'ReviewCardSection.transportFee' })}
            </div>
            <div className={css.fee}>0đ</div>
          </div>
        </div>
        <div className={css.feeItem}>
          <div className={css.feeItemContainer}>
            <div className={css.label}>
              {intl.formatMessage({ id: 'ReviewCardSection.promotion' })}
            </div>
            <div className={css.fee}>0đ</div>
          </div>
        </div>
        <div className={css.feeItem}>
          <div className={css.feeItemContainer}>
            <div className={css.totalWithoutVATLabel}>
              {intl.formatMessage({ id: 'ReviewCardSection.totalWithoutVAT' })}
            </div>

            <div className={css.fee}>0đ</div>
          </div>
        </div>
        <div className={css.feeItem}>
          <div
            className={classNames(css.feeItemContainer, css.VATItemContainer)}>
            <div className={css.label}>
              {intl.formatMessage({ id: 'ReviewCardSection.VAT' })}
              <Badge label="10%" className={css.VATBadge} />
            </div>
            <div className={css.fee}>0đ</div>
          </div>
        </div>
        <div className={css.feeItem}>
          <div className={css.totalWithVATLabel}>
            {intl.formatMessage({ id: 'ReviewCardSection.totalWithVAT' })}
          </div>
          <div className={css.totalWithVAT}>{totalPrice}đ</div>
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

      <div className={css.downloadPriceQuotation}>
        {intl.formatMessage({
          id: 'ReviewCardSection.downloadPriceQuotation',
        })}
      </div>

      <Button variant="cta" className={css.makePaymentButton} disabled>
        <div>
          {intl.formatMessage({
            id: 'ReviewCardSection.makePayment',
          })}
        </div>
      </Button>

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
