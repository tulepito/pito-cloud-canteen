import { useMemo } from 'react';
import type { Event } from 'react-big-calendar';
import { useIntl } from 'react-intl';
import { shallowEqual } from 'react-redux';

import OrderEventCardStatus from '@components/CalendarDashboard/components/OrderEventCard/OrderEventCardStatus';
import { EVENT_STATUS } from '@components/CalendarDashboard/helpers/constant';
import IconBanned from '@components/Icons/IconBanned/IconBanned';
import IconDeadline from '@components/Icons/IconDeadline/IconDeadline';
import IconFood from '@components/Icons/IconFood/IconFood';
import IconLocation from '@components/Icons/IconLocation/IconLocation';
import IconShop from '@components/Icons/IconShop/IconShop';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { isOver } from '@helpers/orderHelper';
import { useAppSelector } from '@hooks/reduxHooks';
import { calculateRemainTime } from '@src/utils/dates';

import css from './SubOrderCard.module.scss';

type TSubOrderCardProps = {
  event: Event;
  onRejectSelectDish: (params: any) => void;
  setSelectedEvent: (event: Event) => void;
  openSubOrderDetailModal: () => void;
};

const SubOrderCard: React.FC<TSubOrderCardProps> = (props) => {
  const { event, setSelectedEvent, openSubOrderDetailModal } = props;
  const intl = useIntl();
  const {
    daySession,
    deliveryHour,
    restaurantAddress,
    restaurant,
    status,
    deadlineDate,
    meal,
    dishSelection,
    orderColor,
    transactionId,
    isOrderStarted = false,
  } = event?.resource || {};

  const { name: restaurantName } = restaurant;
  const orderTitle = event?.title || '';
  const isFoodPicked = !!event.resource?.dishSelection?.dishSelection;
  const isNotJoined = status === EVENT_STATUS.NOT_JOINED_STATUS;
  const isExpired = isOver(event.resource?.expiredTime);
  const isExpiredToPickFood = isExpired && !isFoodPicked && !isNotJoined;
  const headerStyles = {
    backgroundColor: isExpiredToPickFood ? '#8C8C8C' : orderColor,
  };
  const remainTime = calculateRemainTime(deadlineDate);
  const selectionFoodName = meal?.dishes.find(
    (item: any) => item.key === dishSelection?.dishSelection,
  )?.value;

  const shouldShowRejectButton = [EVENT_STATUS.NOT_JOINED_STATUS].includes(
    status,
  );
  const shouldShowCountdown = !isOrderStarted && !isExpired;

  const subOrderTxs = useAppSelector(
    (state) => state.ParticipantOrderList.subOrderTxs,
    shallowEqual,
  );

  const subOrderTx = useMemo(
    () => subOrderTxs.find((tx) => tx.id.uuid === transactionId),
    [subOrderTxs, transactionId],
  );

  const onCardClick = () => {
    setSelectedEvent(event);
    openSubOrderDetailModal();
  };

  return (
    <div className={css.container} onClick={onCardClick}>
      <div className={css.header} style={headerStyles}>
        <div className={css.row}>
          <div className={css.daySession}>
            {intl.formatMessage({ id: `DayColumn.Session.${daySession}` })}
          </div>
          <div className={css.orderHour}>{deliveryHour}</div>
        </div>
        <div>{`#${orderTitle}`}</div>
        <div className={css.PCCText}>PITO Cloud Canteen</div>
      </div>
      <div className={css.body}>
        <div className={css.row}>
          <OrderEventCardStatus status={status} subOrderTx={subOrderTx} />
        </div>
        <RenderWhen condition={!!selectionFoodName}>
          <div className={css.row}>
            <div className={css.selectedFood}>
              <IconFood />
              <span>{selectionFoodName}</span>
            </div>
          </div>
        </RenderWhen>
        <RenderWhen condition={shouldShowRejectButton}>
          <div className={css.row}>
            <div className={css.noPickThisDay}>
              <IconBanned />
              <span>Bỏ chọn ngày này</span>
            </div>
          </div>
        </RenderWhen>
        <div className={css.orderInfo}>
          <RenderWhen condition={shouldShowCountdown}>
            <div className={css.row}>
              <div className={css.orderDeadline}>
                <IconDeadline />
                <span>Còn {remainTime} để chọn</span>
              </div>
            </div>
          </RenderWhen>
          <div className={css.row}>
            <div className={css.deliveryAddress}>
              <IconLocation />
              <span>{restaurantAddress}</span>
            </div>
          </div>
          <div className={css.row}>
            <div className={css.restaurantName}>
              <IconShop />
              <span>{restaurantName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubOrderCard;
