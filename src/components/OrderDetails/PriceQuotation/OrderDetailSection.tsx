import { useIntl } from 'react-intl';

import { formatTimestamp } from '@src/utils/dates';
import type { TObject } from '@src/utils/types';

import css from './OrderDetailSection.module.scss';

type TOrderDetailSectionProps = { foodOrderGroupedByDate: TObject[] };

const OrderDetailSection: React.FC<TOrderDetailSectionProps> = ({
  foodOrderGroupedByDate,
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

        {foodOrderGroupedByDate.map((dateData) => {
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
            <div className={css.tableRowGroup} key={date}>
              <div className={css.groupTitle}>
                <div>{index + 1}</div>
                <div>
                  {formattedDate}
                  <div className={css.restaurantName} title={restaurantName}>
                    {restaurantName}
                  </div>
                </div>
                <div>{totalDishes}</div>
                <div>{totalPriceOfDate}đ</div>
              </div>
              <div className={css.rows}>
                {foodDataList.map((foodData: TObject) => {
                  const { foodId, foodPrice, foodName, frequency } = foodData;

                  return (
                    <div className={css.row} key={foodId}>
                      <div></div>
                      <div>{foodName}</div>
                      <div>{frequency}</div>
                      <div>{foodPrice}đ</div>
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
