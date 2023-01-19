import Collapsible from '@components/Collapsible/Collapsible';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import type { TObject } from '@utils/types';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';

import css from './ReviewOrderDetailsSection.module.scss';

type TReviewOrderDetailsSectionProps = {
  className?: string;
  foodOrderGroupedByDate: TObject[];
};

const ReviewOrderDetailsSection: React.FC<TReviewOrderDetailsSectionProps> = (
  props,
) => {
  const { className, foodOrderGroupedByDate } = props;
  const intl = useIntl();

  const [isCollapsed, setIsCollapsed] = useState(
    Array.from({ length: foodOrderGroupedByDate?.length }).fill(0),
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
          {foodOrderGroupedByDate.map((dateData) => {
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
