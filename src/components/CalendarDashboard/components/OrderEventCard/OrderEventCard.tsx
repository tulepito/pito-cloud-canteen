import { useMemo } from 'react';
import type { Event } from 'react-big-calendar';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';

import Tooltip from '@components/Tooltip/Tooltip';
import { isOver } from '@helpers/orderHelper';
import { useAppSelector } from '@hooks/reduxHooks';
import { useViewport } from '@hooks/useViewport';

import OrderEventCardContentItems from './OrderEventCardContentItems';
import OrderEventCardHeader from './OrderEventCardHeader';
import OrderEventCardPopup from './OrderEventCardPopup';
import OrderEventCardStatus from './OrderEventCardStatus';

import css from './OrderEventCard.module.scss';

export type TOrderEventCardProps = {
  event: Event;
  index: number;
};

const OrderEventCard: React.FC<TOrderEventCardProps> = ({ event }) => {
  const { isMobileLayout } = useViewport();
  const {
    status,
    expiredTime,
    isOrderStarted = false,
    transactionId,
  } = event.resource || {};

  const isFoodPicked = !!event.resource?.dishSelection?.dishSelection;
  const isExpired = isOver(expiredTime);
  const isExpiredAndNotPickedFood =
    !isFoodPicked && (isExpired || isOrderStarted);

  const { orderColor } = event?.resource || {};
  const dotStyles = {
    backgroundColor: isExpiredAndNotPickedFood ? '#8C8C8C' : orderColor,
  };
  const cardStyles = {
    borderColor: isExpiredAndNotPickedFood ? '#8C8C8C' : orderColor,
  };

  const subOrderTxs = useAppSelector(
    (state) => state.ParticipantOrderList.subOrderTxs,
    shallowEqual,
  );

  const subOrderTx = useMemo(
    () => subOrderTxs.find((tx) => tx.id.uuid === transactionId),
    [subOrderTxs, transactionId],
  );

  return (
    <Tooltip
      overlayClassName={css.tooltipOverlay}
      tooltipContent={
        <OrderEventCardPopup
          event={event}
          status={status}
          isExpired={isExpired}
        />
      }
      placement="rightTop"
      trigger={isMobileLayout ? '' : 'click'}
      overlayInnerStyle={{ backgroundColor: '#fff' }}>
      <div>
        <div
          className={classNames(css.root, {
            [css.rootExpired]: isExpired,
          })}
          style={cardStyles}>
          <OrderEventCardHeader event={event} />
          <div className={css.eventCardContentWrapper}>
            <OrderEventCardStatus
              className={css.cardStatus}
              status={status}
              subOrderTx={subOrderTx}
            />
            <OrderEventCardContentItems event={event} />
          </div>
        </div>
        <div className={css.dot} style={dotStyles}></div>
      </div>
    </Tooltip>
  );
};

export default OrderEventCard;
