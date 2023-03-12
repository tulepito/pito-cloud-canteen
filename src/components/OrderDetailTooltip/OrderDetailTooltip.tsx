/* eslint-disable @typescript-eslint/no-shadow */
import StateItem from '@components/TimeLine/StateItem';
import { formatTimestamp } from '@src/utils/dates';
import type { TIntegrationListing } from '@src/utils/types';
import { parsePrice } from '@src/utils/validators';

import css from './OrderDetailTooltip.module.scss';

const OrderDetailTooltip = ({
  subOrders = [],
}: {
  subOrders: TIntegrationListing[];
}) => {
  const orderDetails = subOrders.reduce(
    (prev: any, subOrder: TIntegrationListing) => {
      const { orderDetail = {} } = subOrder?.attributes?.metadata || {};

      const subOrderDetails = Object.keys(orderDetail).map((key) => {
        const { transaction, totalPrice } = orderDetail[key];
        // const { foodList = {} } = restaurant;
        // const totalPrice = Object.keys(foodList).reduce((prev, cur) => {
        //   const price = foodList[cur].foodPrice;
        //   return prev + price;
        // }, 0);

        return (
          <div key={key} className={css.orderDetailTooltipItem}>
            <StateItem
              className={css.stateItem}
              data={{ tx: transaction, date: formatTimestamp(Number(key)) }}
            />
            <span> {parsePrice(String(totalPrice))}đ</span>
          </div>
        );
      });

      return [...prev, ...subOrderDetails];
    },
    [],
  );

  return <div className={css.tooltip}>{orderDetails}</div>;
};

export default OrderDetailTooltip;
