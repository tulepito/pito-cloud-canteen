import classNames from 'classnames';

import NamedLink from '@components/NamedLink/NamedLink';
import SubOrderBadge from '@components/SubOrderBadge/SubOrderBadge';
import { parseThousandNumber } from '@helpers/format';
import { partnerPaths } from '@src/paths';
import { formatTimestamp } from '@src/utils/dates';
import type { ETransition } from '@src/utils/transaction';

import css from './SubOrderItem.module.scss';

type TSubOrderItemProps = {
  subOrder: {
    subOrderTitle: string;
    companyName: string;
    subOrderDate: string;
    deliveryHour: string;
    lastTransition: ETransition;
    revenue: number;
    totalDishes: number;
    subOrderId: string;
  };
};

const SubOrderItem: React.FC<TSubOrderItemProps> = (props) => {
  const { subOrder } = props;
  const {
    subOrderTitle,
    companyName,
    subOrderDate,
    deliveryHour,
    lastTransition,
    revenue,
    totalDishes,
    subOrderId,
  } = subOrder;

  const rowItem = ({
    label,
    value,
    isBoldValue,
  }: {
    label: string;
    value: string;
    isBoldValue?: boolean;
  }) => (
    <div className={css.row}>
      <div className={css.label}>{label}</div>
      <div className={classNames(css.value, isBoldValue && css.boldText)}>
        {value}
      </div>
    </div>
  );

  return (
    <div className={css.root}>
      <div className={css.header}>
        <div className={css.row}>
          <div className={css.companyName}>{companyName}</div>
          <div className={css.subOrderDate}>
            {formatTimestamp(+subOrderDate)}
          </div>
        </div>
        <div className={css.subOrderTitle}>#{subOrderTitle}</div>
      </div>
      <div className={css.content}>
        {rowItem({
          label: 'Doanh thu',
          value: `${parseThousandNumber(revenue)}đ`,
          isBoldValue: true,
        })}
        {rowItem({ label: 'Thời gian', value: deliveryHour })}
        {rowItem({ label: 'Số lượng đặt', value: `${totalDishes}` })}
      </div>
      <div className={css.footer}>
        <div className={css.actions}>
          <NamedLink
            className={css.link}
            path={partnerPaths.SubOrderDetail.replace(
              '[subOrderId]',
              subOrderId,
            )}>
            Xem chi tiết
          </NamedLink>
        </div>
        <SubOrderBadge lastTransition={lastTransition} />
      </div>
    </div>
  );
};

export default SubOrderItem;
