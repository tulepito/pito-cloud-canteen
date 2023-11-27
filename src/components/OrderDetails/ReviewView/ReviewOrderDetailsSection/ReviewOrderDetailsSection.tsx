import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import { DateTime } from 'luxon';

import Collapsible from '@components/Collapsible/Collapsible';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { parseThousandNumber } from '@helpers/format';
import { formatTimestamp, weekDayFormatFromDateTime } from '@utils/dates';
import type { TObject } from '@utils/types';

import css from './ReviewOrderDetailsSection.module.scss';

type TReviewOrderDetailsSectionProps = {
  className?: string;
  foodOrderGroupedByDate: TObject[];
  outsideCollapsible?: boolean;
};

const ReviewOrderDetailsSection: React.FC<TReviewOrderDetailsSectionProps> = (
  props,
) => {
  const {
    className,
    foodOrderGroupedByDate,
    outsideCollapsible = false,
  } = props;
  const groupedFoodListLength = foodOrderGroupedByDate?.length;
  const initialCollapseStates = Array.from({
    length: groupedFoodListLength,
  }).fill(0);

  const intl = useIntl();
  const [isCollapsed, setIsCollapsed] = useState(initialCollapseStates);

  const currentYear = new Date().getFullYear();
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

  useEffect(() => {
    setIsCollapsed(initialCollapseStates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCollapseStates.length]);

  const dataTable = (
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
            restaurantName = '',
            index,
          } = dateData;
          const isCurrentYear =
            new Date(Number(date)).getFullYear() === currentYear;
          const formattedWeekDay = weekDayFormatFromDateTime(
            DateTime.fromMillis(Number(date)),
          );
          const formattedDate = `${formattedWeekDay}, ${formatTimestamp(
            date,
            isCurrentYear ? 'dd/MM' : 'dd/MM/yyyy',
          )}`;

          const groupTitleClasses = classNames(css.groupTitle, {
            [css.collapsed]: isCollapsed[index],
          });
          const rowsClasses = classNames(css.rows, {
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
                <div>{parseThousandNumber(totalPrice || 0)}đ</div>
                <div
                  className={css.actionCell}
                  onClick={handleClickGroupTitle(index)}>
                  <IconArrow className={iconClasses} />
                </div>
              </div>
              <div className={rowsClasses}>
                {foodDataList.map((foodData: TObject) => {
                  const {
                    foodId,
                    foodPrice,
                    foodUnit = '',
                    foodName,
                    frequency,
                  } = foodData;

                  return (
                    <div className={css.row} key={foodId}>
                      <div></div>
                      <div>{foodName}</div>
                      <div>{foodUnit}</div>
                      <div>{frequency}</div>
                      <div>{parseThousandNumber(foodPrice || 0)}đ</div>
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
  );

  return (
    <RenderWhen condition={outsideCollapsible}>
      {dataTable}
      <RenderWhen.False>
        <Collapsible
          openClassName={css.rootOpen}
          labelClassName={css.rootLabel}
          className={rootClasses}
          label={intl.formatMessage({
            id: 'ReviewOrderDetailsSection.title',
          })}>
          {dataTable}
        </Collapsible>
      </RenderWhen.False>
    </RenderWhen>
  );
};

export default ReviewOrderDetailsSection;
