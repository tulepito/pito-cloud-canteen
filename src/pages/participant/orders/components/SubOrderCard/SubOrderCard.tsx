import type { Event } from 'react-big-calendar';
import { useIntl } from 'react-intl';

import OrderEventCardStatus from '@components/CalendarDashboard/components/OrderEventCard/OrderEventCardStatus';
import { EVENT_STATUS } from '@components/CalendarDashboard/helpers/constant';
import IconBanned from '@components/Icons/IconBanned/IconBanned';
import IconDeadline from '@components/Icons/IconDeadline/IconDeadline';
import IconFood from '@components/Icons/IconFood/IconFood';
import IconLocation from '@components/Icons/IconLocation/IconLocation';
import IconShop from '@components/Icons/IconShop/IconShop';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { isOver } from '@helpers/orderHelper';
import { calculateRemainTime } from '@src/utils/dates';

import css from './SubOrderCard.module.scss';

type TSubOrderCardProps = {
  event: Event;
  onRejectSelectDish: (params: any) => void;
  setSelectedEvent: (event: Event) => void;
  openSubOrderDetailModal: () => void;
};

const SubOrderCard: React.FC<TSubOrderCardProps> = (props) => {
  const {
    event,
    onRejectSelectDish,
    setSelectedEvent,
    openSubOrderDetailModal,
  } = props;
  const intl = useIntl();
  const {
    daySession,
    deliveryHour,
    deliveryAddress,
    restaurant,
    status,
    orderId,
    timestamp,
    planId,
    deadlineDate,
    meal,
    dishSelection,
    orderColor,
  } = event?.resource || {};
  const { address } = deliveryAddress;
  const { name: restaurantName } = restaurant;
  const orderTitle = event?.title || '';
  const isFoodPicked = !!event.resource?.dishSelection?.dishSelection;
  const isExpired = isOver(event.resource?.expiredTime) && !isFoodPicked;
  const headerStyles = {
    backgroundColor: isExpired ? '#262626' : orderColor,
  };
  const remainTime = calculateRemainTime(deadlineDate);

  const selectionFoodName = meal?.dishes.find(
    (item: any) => item.key === dishSelection?.dishSelection,
  )?.value;
  const shouldShowRejectButton = status === EVENT_STATUS.EMPTY_STATUS;

  const onCardClick = () => {
    setSelectedEvent(event);
    openSubOrderDetailModal();
  };

  const handleRejectSelectDish = (e: any) => {
    e.stopPropagation();

    onRejectSelectDish({
      orderId,
      orderDay: timestamp,
      planId,
    });
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
          <OrderEventCardStatus status={status} />
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
            <div className={css.noPickThisDay} onClick={handleRejectSelectDish}>
              <IconBanned />
              <span>Bỏ chọn ngày này</span>
            </div>
          </div>
        </RenderWhen>
        <div className={css.orderInfo}>
          <div className={css.row}>
            <div className={css.orderDeadline}>
              <IconDeadline />
              <span>Còn {remainTime} để chọn</span>
            </div>
          </div>
          <div className={css.row}>
            <div className={css.deliveryAddress}>
              <IconLocation />
              <span>{address}</span>
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
