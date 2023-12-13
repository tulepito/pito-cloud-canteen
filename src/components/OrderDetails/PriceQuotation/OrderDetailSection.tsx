import { useIntl } from 'react-intl';
import classNames from 'classnames';

import { parseThousandNumber } from '@helpers/format';
import { formatTimestamp } from '@src/utils/dates';
import type { TObject } from '@src/utils/types';

import css from './OrderDetailSection.module.scss';

type TOrderDetailSectionProps = {
  foodOrderGroupedByDate: TObject[];
  itemId: string;
  subOrderDate?: number | string;
  shouldResponsive?: boolean;
};

const OrderDetailSection: React.FC<TOrderDetailSectionProps> = ({
  foodOrderGroupedByDate,
  itemId,
  subOrderDate,
  shouldResponsive = false,
}) => {
  const intl = useIntl();

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
                <div>{totalDishes}</div>
                <div>{parseThousandNumber(totalPriceOfDate || 0)}đ</div>
              </div>
              <div className={css.rows}>
                {foodDataList.map((foodData: TObject, childIndex: number) => {
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
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderDetailSection;
