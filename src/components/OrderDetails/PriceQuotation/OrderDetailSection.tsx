import { useIntl } from 'react-intl';
import classNames from 'classnames';

import { parseThousandNumber } from '@helpers/format';
import { formatTimestamp } from '@src/utils/dates';
import type { TFoodDataValue, TObject } from '@src/utils/types';

import css from './OrderDetailSection.module.scss';

const RICE_MEAL_MAIN_DISHES_COUNT = 2;

type TOrderDetailSectionProps = {
  foodOrderGroupedByDate: TObject[];
  itemId: string;
  subOrderDate?: number | string;
  shouldResponsive?: boolean;
  isAllowAddSecondaryFood?: boolean;
};

const OrderDetailSection: React.FC<TOrderDetailSectionProps> = ({
  foodOrderGroupedByDate,
  itemId,
  subOrderDate,
  shouldResponsive = false,
  isAllowAddSecondaryFood = false,
}) => {
  const intl = useIntl();

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

  const getFormattedPrice = (price: number) => {
    return `${parseThousandNumber(price || 0)}đ`;
  };

  const sectionClasses = classNames(css.orderDetailSection, {
    [css.mobileLayout]: shouldResponsive,
  });

  return (
    <div className={sectionClasses}>
      <div className={css.sectionTitle}>
        {intl.formatMessage({
          id: 'OrderDetails.PriceQuotation.orderDetailSection.title',
        })}
      </div>
      <div className={css.sectionContentContainer}>
        <div className={css.tableHead}>
          <div>
            {intl.formatMessage({
              id: 'OrderDetails.PriceQuotation.orderDetailSection.head.no',
            })}
          </div>
          <div>
            {intl.formatMessage({
              id: 'OrderDetails.PriceQuotation.orderDetailSection.head.type',
            })}
          </div>
          <div>
            {intl.formatMessage({
              id: 'OrderDetails.PriceQuotation.orderDetailSection.head.quantity',
            })}
          </div>
          <div>
            {intl.formatMessage({
              id: 'OrderDetails.PriceQuotation.orderDetailSection.head.cost',
            })}
          </div>
        </div>

        {foodOrderGroupedByDate.map((dateData, parentIndex) => {
          const {
            date,
            totalDishes,
            totalPrice: totalPriceOfDate,
            foodDataList,
            restaurantName,
            index,
          } = dateData;
          if (subOrderDate && subOrderDate?.toString() !== date.toString()) {
            return null;
          }

          const formattedDate = formatTimestamp(date, 'EEE, dd/MM/yyyy');

          let adjustedTotalDishes = totalDishes;
          if (isAllowAddSecondaryFood) {
            const { totalNonRiceQuantity, totalRiceMainFrequency } =
              buildRiceAndNonRiceGroups(foodDataList as TFoodDataValue[]);
            const riceMealCount =
              totalRiceMainFrequency / RICE_MEAL_MAIN_DISHES_COUNT;
            adjustedTotalDishes = totalNonRiceQuantity + riceMealCount;
          }

          return (
            <div
              className={classNames(css.tableRowGroup, 'item-line')}
              id={`${itemId}-root-${parentIndex}`}
              key={date}>
              <div
                className={classNames(css.groupTitle, 'item-title')}
                id={`${itemId}-${parentIndex}`}>
                <div>{subOrderDate ? 1 : index + 1}</div>
                <div>
                  {formattedDate}
                  <div className={css.restaurantName} title={restaurantName}>
                    {restaurantName}
                  </div>
                </div>
                <div>{adjustedTotalDishes}</div>
                <div>{parseThousandNumber(totalPriceOfDate || 0)}đ</div>
              </div>
              <div className={css.rows}>
                {isAllowAddSecondaryFood ? (
                  <>
                    {(() => {
                      const {
                        riceDishes,
                        nonRiceDishes,
                        totalNonRiceQuantity,
                        nonRiceUnitPrice,
                        totalRiceMainFrequency,
                        riceMealUnitPrice,
                      } = buildRiceAndNonRiceGroups(
                        foodDataList as TFoodDataValue[],
                      );
                      let rowIndex = 0;

                      return (
                        <>
                          {nonRiceDishes.length > 0 && (
                            <>
                              <div
                                className={classNames(css.row, 'item-row')}
                                id={`${itemId}-${parentIndex}-${rowIndex++}`}>
                                <div>{(index as number) + 1}.1</div>
                                <div>
                                  {intl.formatMessage({
                                    id: 'ReviewOrderDetailWithSecondaryFood.nonRiceTitle',
                                  })}
                                </div>
                                <div>{totalNonRiceQuantity}</div>
                                <div>{getFormattedPrice(nonRiceUnitPrice)}</div>
                              </div>

                              {nonRiceDishes.map((food: TFoodDataValue) => (
                                <div
                                  className={classNames(css.row, 'item-row')}
                                  key={food.foodId}
                                  id={`${itemId}-${parentIndex}-${rowIndex++}`}>
                                  <div></div>
                                  <div>{food.foodName}</div>
                                  <div>{food.frequency}</div>
                                  <div></div>
                                </div>
                              ))}
                            </>
                          )}

                          {riceDishes.length > 0 && (
                            <>
                              <div
                                className={classNames(css.row, 'item-row')}
                                id={`${itemId}-${parentIndex}-${rowIndex++}`}>
                                <div>{(index as number) + 1}.2</div>
                                <div>
                                  {intl.formatMessage({
                                    id: 'ReviewOrderDetailWithSecondaryFood.riceSummary',
                                  })}
                                  <br />
                                  <span className="font-semibold text-[10px]">
                                    {intl.formatMessage(
                                      {
                                        id: 'ReviewOrderDetailWithSecondaryFood.riceNote',
                                      },
                                      {
                                        mainPerMeal:
                                          RICE_MEAL_MAIN_DISHES_COUNT,
                                      },
                                    )}
                                  </span>
                                </div>
                                <div>
                                  {totalRiceMainFrequency /
                                    RICE_MEAL_MAIN_DISHES_COUNT}
                                </div>
                                <div>
                                  {getFormattedPrice(riceMealUnitPrice)}
                                </div>
                              </div>

                              {riceDishes.map((food: TFoodDataValue) => (
                                <div
                                  className={classNames(css.row, 'item-row')}
                                  key={food.foodId}
                                  id={`${itemId}-${parentIndex}-${rowIndex++}`}>
                                  <div></div>
                                  <div>{food.foodName}</div>
                                  <div>{food.frequency}</div>
                                  <div></div>
                                </div>
                              ))}
                            </>
                          )}
                        </>
                      );
                    })()}
                  </>
                ) : (
                  foodDataList.map((foodData: TObject, childIndex: number) => {
                    const { foodId, foodPrice, foodName, frequency } = foodData;

                    return (
                      <div
                        className={classNames(css.row, 'item-row')}
                        key={foodId}
                        id={`${itemId}-${parentIndex}-${childIndex}`}>
                        <div></div>
                        <div>{foodName}</div>
                        <div>{frequency}</div>
                        <div>{parseThousandNumber(foodPrice || 0)}đ</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderDetailSection;
