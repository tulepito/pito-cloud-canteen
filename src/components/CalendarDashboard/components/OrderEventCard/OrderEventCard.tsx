import { useMemo } from 'react';
import type { Event } from 'react-big-calendar';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';

import Tooltip from '@components/Tooltip/Tooltip';
import { isOver } from '@helpers/orderHelper';
import { useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useViewport } from '@hooks/useViewport';

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
  const {
    openRatingSubOrderModal,
    setSelectedEvent,
    recommendFoodForSpecificSubOrder,
    pickFoodForSpecificSubOrderInProgress,
  } = resources || {};
  const {
    status,
    expiredTime,
    isOrderStarted = false,
    transactionId,
    subOrderTx: subOrderTxFromEvent,
    planId,
    orderId,
    timestamp,
  } = event.resource || {};

  const tooltipVisibleController = useBoolean();

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

  const handleOpenRatingModal = () => {
    if (typeof openRatingSubOrderModal === 'function') {
      tooltipVisibleController.setFalse();
      openRatingSubOrderModal(subOrderTx);
    }
  };

  const onPickForMe = () => {
    recommendFoodForSpecificSubOrder({
      planId,
      orderId,
      subOrderDate: timestamp,
    });
  };

  return (
    <Tooltip
      overlayClassName={css.tooltipOverlay}
      visible={tooltipVisibleController.value}
      tooltipContent={
        <OrderEventCardPopup
          event={event}
          status={status}
          isExpired={isExpired}
          subOrderDocument={subOrderDocument}
          subOrderTx={subOrderTx}
          fetchSubOrderTxInProgress={fetchSubOrderTxInProgress}
          fetchSubOrderDocumentInProgress={fetchSubOrderDocumentInProgress}
          openRatingSubOrderModal={handleOpenRatingModal}
          onCloseEventCardPopup={tooltipVisibleController.setFalse}
          onPickForMe={onPickForMe}
          pickFoodForSpecificSubOrderInProgress={
            pickFoodForSpecificSubOrderInProgress
          }
        />
      }
      onVisibleChange={(visible) => {
        if (visible) {
          if (typeof setSelectedEvent === 'function') setSelectedEvent(event);
        }
        tooltipVisibleController.setValue(visible);
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
