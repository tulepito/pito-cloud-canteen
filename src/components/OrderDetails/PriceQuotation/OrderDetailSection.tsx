import { useIntl } from 'react-intl';
import classNames from 'classnames';

import { parseThousandNumber } from '@helpers/format';
import { formatTimestamp } from '@src/utils/dates';
import type { TObject } from '@src/utils/types';

import css from './OrderDetailSection.module.scss';

type TOrderDetailSectionProps = {
  foodOrderGroupedByDate: TObject[];
  itemId: string;
};

const OrderDetailSection: React.FC<TOrderDetailSectionProps> = ({
  foodOrderGroupedByDate,
  itemId,
}) => {
  const intl = useIntl();

  return (
    <div className={css.orderDetailSection}>
      <div className={css.sectionTitle}>
        {intl.formatMessage({
          id: 'BookerOrderDetailsPriceQuotation.orderDetailSection.title',
        })}
      </div>
      <div className={css.sectionContentContainer}>
        <div className={css.tableHead}>
          <div>
            {intl.formatMessage({
              id: 'BookerOrderDetailsPriceQuotation.orderDetailSection.head.no',
            })}
          </div>
          <div>
            {intl.formatMessage({
              id: 'BookerOrderDetailsPriceQuotation.orderDetailSection.head.type',
            })}
          </div>
          <div>
            {intl.formatMessage({
              id: 'BookerOrderDetailsPriceQuotation.orderDetailSection.head.quantity',
            })}
          </div>
          <div>
            {intl.formatMessage({
              id: 'BookerOrderDetailsPriceQuotation.orderDetailSection.head.cost',
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
          const formattedDate = formatTimestamp(date, 'EEE, dd/MM/yyyy');

          return (
            <div
              className={classNames(css.tableRowGroup, 'item-line')}
              id={`${itemId}-root-${parentIndex}`}
              key={date}>
              <div
                className={classNames(css.groupTitle, 'item-title')}
                id={`${itemId}-${parentIndex}`}>
                <div>{index + 1}</div>
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
