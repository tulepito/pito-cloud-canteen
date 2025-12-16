import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import { DateTime } from 'luxon';

import Collapsible from '@components/Collapsible/Collapsible';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { parseThousandNumber } from '@helpers/format';
import { useViewport } from '@hooks/useViewport';
import type { TFoodDataValue, TObject } from '@src/utils/types';
import { formatTimestamp, weekDayFormatFromDateTime } from '@utils/dates';

import css from '../ReviewOrderDetailsSection/ReviewOrderDetailsSection.module.scss';

type TReviewOrderDetailWithSecondaryFoodProps = {
  className?: string;
  foodOrderGroupedByDate: TObject[];
  outsideCollapsible?: boolean;
};

const RICE_MEAL_MAIN_DISHES_COUNT = 2;

const buildRiceAndNonRiceGroups = (foodDataList: TFoodDataValue[]) => {
  const riceDishes: TFoodDataValue[] = [];
  const nonRiceDishes: TFoodDataValue[] = [];

  foodDataList.forEach((food) => {
    const { numberOfMainDishes } = food;

    if (Number(numberOfMainDishes) === 1) {
      nonRiceDishes.push(food);
    } else {
      riceDishes.push(food);
    }
  });

  const totalNonRiceQuantity = nonRiceDishes.reduce(
    (sum, item) => sum + (item.frequency || 0),
    0,
  );
  const nonRiceUnitPrice =
    nonRiceDishes.length > 0 ? nonRiceDishes[0].foodPrice || 0 : 0;

  const totalRiceMainFrequency = riceDishes.reduce(
    (sum, item) => sum + (item.frequency || 0),
    0,
  );
  const riceMainUnitPrice =
    riceDishes.length > 0 ? riceDishes[0].foodPrice || 0 : 0;
  const riceMealUnitPrice =
    riceMainUnitPrice * RICE_MEAL_MAIN_DISHES_COUNT || 0;

  return {
    riceDishes,
    nonRiceDishes,
    totalNonRiceQuantity,
    nonRiceUnitPrice,
    totalRiceMainFrequency,
    riceMealUnitPrice,
  };
};

const ReviewOrderDetailWithSecondaryFood: React.FC<
  TReviewOrderDetailWithSecondaryFoodProps
> = (props) => {
  const {
    className,
    foodOrderGroupedByDate,
    outsideCollapsible = false,
  } = props;
  const { isMobileLayout } = useViewport();

  const groupedFoodListLength = foodOrderGroupedByDate?.length;
  const initialCollapseStates = Array.from({
    length: groupedFoodListLength,
  }).fill(0);

  const intl = useIntl();
  const [isCollapsed, setIsCollapsed] = useState(initialCollapseStates);
  const [subCollapsedState, setSubCollapsedState] = useState<
    Record<number, { nonRice: boolean; rice: boolean }>
  >({});

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

  const handleClickSubGroupTitle =
    (index: number, key: 'nonRice' | 'rice') => () => {
      setSubCollapsedState((prev) => {
        const current = prev[index] || { nonRice: false, rice: false };

        return {
          ...prev,
          [index]: {
            ...current,
            [key]: !current[key],
          },
        };
      });
    };

  useEffect(() => {
    setIsCollapsed(initialCollapseStates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCollapseStates.length]);

  const getFormattedPrice = (price: number) => {
    return `${parseThousandNumber(price || 0)}đ`;
  };

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
        {foodOrderGroupedByDate.map((dateData: TObject) => {
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

          const collapseStatus = isCollapsed[index];
          const groupTitleClasses = classNames(css.groupTitle, {
            [css.collapsed]: collapseStatus,
          });
          const rowsClasses = classNames(css.rows, {
            [css.collapsed]: collapseStatus,
          });
          const iconClasses = classNames({
            [css.reversed]: collapseStatus,
          });

          const {
            riceDishes,
            nonRiceDishes,
            totalNonRiceQuantity,
            nonRiceUnitPrice,
            totalRiceMainFrequency,
            riceMealUnitPrice,
          } = buildRiceAndNonRiceGroups(foodDataList as TFoodDataValue[]);
          const subState = subCollapsedState[index as number] || {
            nonRice: false,
            rice: false,
          };

          return (
            <div className={css.tableRowGroup} key={date as string}>
              <div className={groupTitleClasses}>
                <div>{(index as number) + 1}</div>
                <div>
                  {formattedDate}
                  <div className={css.restaurantName}>{restaurantName}</div>
                </div>
                <div>{''}</div>
                <div>{totalDishes}</div>
                <div>{getFormattedPrice(totalPrice || 0)}</div>
                <div
                  className={css.actionCell}
                  onClick={handleClickGroupTitle(index as number)}>
                  <IconArrow className={iconClasses} />
                </div>
              </div>
              <div className={rowsClasses}>
                {nonRiceDishes.length > 0 && (
                  <>
                    <div
                      className={classNames(css.row, css.subGroupTitle)}
                      onClick={handleClickSubGroupTitle(
                        index as number,
                        'nonRice',
                      )}>
                      <div>{(index as number) + 1}.1</div>
                      <div>
                        {intl.formatMessage({
                          id: 'ReviewOrderDetailWithSecondaryFood.nonRiceTitle',
                        })}
                      </div>
                      <div>{''}</div>
                      <div>{totalNonRiceQuantity}</div>
                      <div>{getFormattedPrice(nonRiceUnitPrice)}</div>
                      <div className={css.actionCell}>
                        <IconArrow
                          className={classNames({
                            [css.reversed]: subState.nonRice,
                          })}
                        />
                      </div>
                    </div>

                    {/* Detail rows for each non-rice dish */}
                    <RenderWhen condition={!subState.nonRice}>
                      <div className={css.subRows}>
                        {nonRiceDishes.map(
                          (food: TFoodDataValue, foodIndex: number) => (
                            <div className={css.row} key={food.foodId}>
                              <div>
                                {(index as number) + 1}.1.{foodIndex + 1}
                              </div>
                              <div>{food.foodName}</div>
                              <div>{''}</div>
                              <div>
                                <RenderWhen condition={isMobileLayout}>
                                  <span>
                                    {intl.formatMessage(
                                      {
                                        id: 'ReviewOrderDetailWithSecondaryFood.quantityLabel',
                                        defaultMessage: '{quantity} phần',
                                      },
                                      { quantity: food.frequency || 0 },
                                    )}
                                  </span>
                                  <RenderWhen.False>
                                    {food.frequency || 0}
                                  </RenderWhen.False>
                                </RenderWhen>
                              </div>
                              <div>{''}</div>
                              <div>{''}</div>
                            </div>
                          ),
                        )}
                      </div>
                    </RenderWhen>
                  </>
                )}

                {/* Rice dishes summary + items */}
                {riceDishes.length > 0 && (
                  <>
                    {/* Summary row for rice dishes */}
                    <div
                      className={classNames(css.row, css.subGroupTitle)}
                      onClick={handleClickSubGroupTitle(
                        index as number,
                        'rice',
                      )}>
                      <div>{(index as number) + 1}.2</div>
                      <div>
                        {intl.formatMessage({
                          id: 'ReviewOrderDetailWithSecondaryFood.riceSummary',
                        })}
                        <br />
                        <span className="font-semibold text-[12px]">
                          {intl.formatMessage(
                            {
                              id: 'ReviewOrderDetailWithSecondaryFood.riceNote',
                            },
                            {
                              mainPerMeal: RICE_MEAL_MAIN_DISHES_COUNT,
                            },
                          )}
                        </span>
                      </div>
                      <div>{''}</div>
                      <div>
                        {totalRiceMainFrequency / RICE_MEAL_MAIN_DISHES_COUNT}
                      </div>
                      <div>{getFormattedPrice(riceMealUnitPrice)}</div>
                      <div className={css.actionCell}>
                        <IconArrow
                          className={classNames({
                            [css.reversed]: subState.rice,
                          })}
                        />
                      </div>
                    </div>

                    {/* Note + detail rows for rice dishes */}
                    <RenderWhen condition={!subState.rice}>
                      <div className={css.subRows}>
                        {/* Detail rows for each rice dish */}
                        {riceDishes.map(
                          (food: TFoodDataValue, foodIndex: number) => (
                            <div className={css.row} key={food.foodId}>
                              <div>
                                {(index as number) + 1}.2.{foodIndex + 1}
                              </div>
                              <div>{food.foodName}</div>
                              <div>{''}</div>
                              <div>
                                <RenderWhen condition={isMobileLayout}>
                                  <span>
                                    {intl.formatMessage(
                                      {
                                        id: 'ReviewOrderDetailWithSecondaryFood.quantityLabel',
                                        defaultMessage: '{quantity} phần',
                                      },
                                      { quantity: food.frequency || 0 },
                                    )}
                                  </span>
                                  <RenderWhen.False>
                                    {food.frequency || 0}
                                  </RenderWhen.False>
                                </RenderWhen>
                              </div>
                              <div>{''}</div>
                              <div>{''}</div>
                            </div>
                          ),
                        )}
                      </div>
                    </RenderWhen>
                  </>
                )}
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
            id: 'ReviewOrderDetailWithSecondaryFood.title',
            defaultMessage: 'Chi tiết đặt hàng',
          })}>
          {dataTable}
        </Collapsible>
      </RenderWhen.False>
    </RenderWhen>
  );
};

export default React.memo(ReviewOrderDetailWithSecondaryFood);
