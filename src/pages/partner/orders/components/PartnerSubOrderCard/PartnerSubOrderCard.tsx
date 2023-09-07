import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconClock from '@components/Icons/IconClock/IconClock';
import IconReceipt from '@components/Icons/IconReceipt/IconReceipt';
import NamedLink from '@components/NamedLink/NamedLink';
import SubOrderBadge from '@components/SubOrderBadge/SubOrderBadge';
import { partnerPaths } from '@src/paths';
import { formatTimestamp } from '@src/utils/dates';
import type { TObject } from '@src/utils/types';

import css from './PartnerSubOrderCard.module.scss';

type PartnerSubOrderCardProps = {
  data: TObject;
};

const PartnerSubOrderCard: React.FC<PartnerSubOrderCardProps> = (props) => {
  const { data } = props;
  const { orderName, totalPrice, lastTransition, deliveryHour, date, id } =
    data;

  return (
    <NamedLink
      path={partnerPaths.SubOrderDetail}
      params={{
        subOrderId: `${id}_${date}`,
      }}>
      <div className={css.container}>
        <div className={css.cardHeader}>
          <div className={css.title}>{orderName}</div>
          <IconArrow direction="right" />
        </div>
        <div className={css.cardContent}>
          <div className={css.flexRow}>
            <IconReceipt className={css.iconReceipt} />
            <span>{totalPrice}</span>
          </div>
          <SubOrderBadge lastTransition={lastTransition} />
        </div>
        <div className={css.cardFooter}>
          <IconClock className={css.iconClock} />
          <div className={css.hour}>{deliveryHour}</div>
          <div className={css.verticalDevider}>&nbsp;</div>
          <div>{formatTimestamp(Number(date))}</div>
        </div>
      </div>
    </NamedLink>
  );
};

export default PartnerSubOrderCard;
