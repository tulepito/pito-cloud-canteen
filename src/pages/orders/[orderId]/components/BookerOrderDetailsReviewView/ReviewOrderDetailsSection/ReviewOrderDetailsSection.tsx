import Collapsible from '@components/Collapsible/Collapsible';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import { EParticipantOrderStatus } from '@utils/enums';
import type { TObject } from '@utils/types';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import React, { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import css from './ReviewOrderDetailsSection.module.scss';

const prepareData = ({ orderDetail = {} }: { orderDetail: TObject }) => {
  return Object.entries(orderDetail).reduce(
    (result, currentOrderDetailEntry, index) => {
      const [date, rawOrderDetailOfDate] = currentOrderDetailEntry;

      const {
        memberOrders,
        foodList: foodListOfDate,
        restaurant: { restaurantName },
      } = rawOrderDetailOfDate as TObject;

      // Object.entries(foodListOfDate).reduce((result, foodData) => {}, );

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
      const summary = foodDataList.reduce(
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
          restaurantName,
        } as TObject,
      );

      return [
        ...result,
        {
          date,
          index,
          ...summary,
          foodDataList,
        },
      ];
    },
    [] as TObject[],
  );
};

type TReviewOrderDetailsSectionProps = {
  className?: string;
  orderDetail: TObject;
};

const ReviewOrderDetailsSection: React.FC<TReviewOrderDetailsSectionProps> = (
  props,
) => {
  const { className, orderDetail } = props;
  const intl = useIntl();
  const preparedData = useMemo(
    () => prepareData({ orderDetail }),
    [orderDetail],
  );

  const [isCollapsed, setIsCollapsed] = useState(
    Array.from({ length: preparedData?.length }).fill(0),
  );

  const rootClasses = classNames(css.root, className);

  const handleClickGroupTitle = (index: number) => () => {
    const changeValue = !isCollapsed[index];
    const newState = isCollapsed.map((i, currIdx) => {
      if (currIdx !== index) {
        return i;
      }
      return changeValue;
    });

    setIsCollapsed(newState);
  };

  return (
    <Collapsible
      className={rootClasses}
      label={intl.formatMessage({ id: 'ReviewOrderDetailsSection.title' })}>
      <div className={css.tableContainer}>
        <div className={css.tableHead}>
          <div>
            {intl.formatMessage({
              id: 'ReviewOrderDetailsSection.tableHead.no',
            })}
          </div>
          <div>
            {intl.formatMessage({
              id: 'ReviewOrderDetailsSection.tableHead.foodType',
            })}
          </div>
          <div>
            {intl.formatMessage({
              id: 'ReviewOrderDetailsSection.tableHead.unit',
            })}
          </div>
          <div>
            {intl.formatMessage({
              id: 'ReviewOrderDetailsSection.tableHead.quantity',
            })}
          </div>

          <div>
            {intl.formatMessage({
              id: 'ReviewOrderDetailsSection.tableHead.price',
            })}
          </div>
          <div></div>
        </div>

        <div className={css.tableBody}>
          {preparedData.map((dateData) => {
            const {
              date,
              totalDishes,
              totalPrice,
              foodDataList,
              restaurantName,
              index,
            } = dateData;
            const formattedDate = DateTime.fromMillis(Number(date)).toFormat(
              'EEE, dd/MM/yyyy',
              { locale: 'vi' },
            );

            const groupTitleClasses = classNames(css.groupTitle, {
              [css.collapsed]: isCollapsed[index],
            });
            const iconClasses = classNames({
              [css.reversed]: isCollapsed[index],
            });

            return (
              <div className={css.tableRowGroup} key={date}>
                <div className={groupTitleClasses}>
                  <div>{index + 1}</div>
                  <div>
                    {formattedDate}
                    <div className={css.restaurantName}>{restaurantName}</div>
                  </div>
                  <div>{''}</div>
                  <div>{totalDishes}</div>
                  <div>{totalPrice}đ</div>
                  <div
                    className={css.actionCell}
                    onClick={handleClickGroupTitle(index)}>
                    <IconArrow className={iconClasses} />
                  </div>
                </div>
                <div className={css.rows}>
                  {foodDataList.map((foodData: TObject) => {
                    const { foodId, foodPrice, foodName, frequency } = foodData;

                    return (
                      <div className={css.row} key={foodId}>
                        <div></div>
                        <div>{foodName}</div>
                        <div>{''}</div>
                        <div>{frequency}</div>
                        <div>{foodPrice}đ</div>
                        <div>{''}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Collapsible>
  );
};

export default ReviewOrderDetailsSection;
