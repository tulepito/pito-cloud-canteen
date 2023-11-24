import type { Event } from 'react-big-calendar';
import { shallowEqual } from 'react-redux';
import classNames from 'classnames';

import Tooltip from '@components/Tooltip/Tooltip';
import { isOver } from '@helpers/orderHelper';
import { useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useViewport } from '@hooks/useViewport';
import { EParticipantOrderStatus } from '@src/utils/enums';

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
    planId,
    orderId,
    timestamp,
    lastTransition,
  } = event.resource || {};

  const tooltipVisibleController = useBoolean();

  const isFoodPicked = !!event.resource?.dishSelection?.dishSelection;
  const isNotJoined = status === EParticipantOrderStatus.notJoined;
  const isExpired = isOver(expiredTime);
  const isExpiredAndNotPickedFood =
    !isFoodPicked && (isExpired || isOrderStarted) && !isNotJoined;

  const { orderColor } = event?.resource || {};
  const dotStyles = {
    backgroundColor: isExpiredAndNotPickedFood ? '#8C8C8C' : orderColor,
  };
  const cardStyles = {
    borderColor: isExpiredAndNotPickedFood ? '#8C8C8C' : orderColor,
  };
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

  const handleOpenRatingModal = () => {
    if (typeof openRatingSubOrderModal === 'function') {
      tooltipVisibleController.setFalse();
      openRatingSubOrderModal();
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
          lastTransition={lastTransition}
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
            [css.rootExpired]: isExpiredAndNotPickedFood,
          })}
          style={cardStyles}>
          <OrderEventCardHeader event={event} />
          <div className={css.eventCardContentWrapper}>
            <OrderEventCardStatus
              className={css.cardStatus}
              status={status}
              lastTransition={lastTransition}
            />
            <div className={css.orderEventCardContentItems}>
              <OrderEventCardContentItems
                event={event}
                classNameCoverImage={css.coverImage}
                isFirstHighlight={status === EParticipantOrderStatus.empty}
              />
            </div>
          </div>
        </div>
        <div className={css.dot} style={dotStyles}></div>
      </div>
    </Tooltip>
  );
};

export default OrderEventCard;
