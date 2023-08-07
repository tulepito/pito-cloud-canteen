import { useMemo } from 'react';
import type { Event } from 'react-big-calendar';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';

import Tooltip from '@components/Tooltip/Tooltip';
import { isOver } from '@helpers/orderHelper';
import { useAppSelector } from '@hooks/reduxHooks';
import { useViewport } from '@hooks/useViewport';

import { EVENT_STATUS } from '../../helpers/constant';

import OrderEventCardContentItems from './OrderEventCardContentItems';
import OrderEventCardHeader from './OrderEventCardHeader';
import OrderEventCardPopup from './OrderEventCardPopup';
import OrderEventCardStatus from './OrderEventCardStatus';

import css from './OrderEventCard.module.scss';

export type TOrderEventCardProps = {
  event: Event;
  index: number;
  resources?: any;
};

const OrderEventCard: React.FC<TOrderEventCardProps> = ({
  event,
  resources,
}) => {
  const { isMobileLayout } = useViewport();
  const { openRatingSubOrderModal, setSelectedEvent } = resources || {};
  const {
    status,
    expiredTime,
    isOrderStarted = false,
    transactionId,
    subOrderTx: subOrderTxFromEvent,
  } = event.resource || {};

  const isFoodPicked = !!event.resource?.dishSelection?.dishSelection;
  const isExpired = isOver(expiredTime);
  const isExpiredAndNotPickedFood =
    !isFoodPicked && (isExpired || isOrderStarted);

  const eventStatus = isExpiredAndNotPickedFood
    ? EVENT_STATUS.EXPIRED_STATUS
    : status;
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
  const subOrderDocument = useAppSelector(
    (state) => state.ParticipantOrderList.subOrderDocument,
    shallowEqual,
  );
  const fetchSubOrderTxInProgress = useAppSelector(
    (state) => state.ParticipantOrderList.fetchSubOrderTxInProgress,
  );
  const fetchSubOrderDocumentInProgress = useAppSelector(
    (state) => state.ParticipantOrderList.fetchSubOrderDocumentInProgress,
  );

  const subOrderTx = useMemo(
    () =>
      subOrderTxs.find((tx) => tx.id.uuid === transactionId) ||
      subOrderTxFromEvent,
    [subOrderTxFromEvent, subOrderTxs, transactionId],
  );

  return (
    <Tooltip
      overlayClassName={css.tooltipOverlay}
      tooltipContent={
        <OrderEventCardPopup
          event={event}
          status={eventStatus}
          isExpired={isExpired}
          subOrderDocument={subOrderDocument}
          subOrderTx={subOrderTx}
          fetchSubOrderTxInProgress={fetchSubOrderTxInProgress}
          fetchSubOrderDocumentInProgress={fetchSubOrderDocumentInProgress}
          openRatingSubOrderModal={openRatingSubOrderModal}
        />
      }
      onVisibleChange={(visible) => {
        if (visible) {
          if (typeof setSelectedEvent === 'function') setSelectedEvent(event);
        }
      }}
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
              status={eventStatus}
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
