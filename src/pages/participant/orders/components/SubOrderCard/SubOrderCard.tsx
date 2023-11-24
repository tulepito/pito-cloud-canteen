import type { Event } from 'react-big-calendar';
import { useIntl } from 'react-intl';

import OrderEventCardContentItems from '@components/CalendarDashboard/components/OrderEventCard/OrderEventCardContentItems';
import OrderEventCardStatus from '@components/CalendarDashboard/components/OrderEventCard/OrderEventCardStatus';
import { EVENT_STATUS } from '@components/CalendarDashboard/helpers/constant';
import { isOver } from '@helpers/orderHelper';
import { EParticipantOrderStatus } from '@src/utils/enums';

import css from './SubOrderCard.module.scss';

type TSubOrderCardProps = {
  event: Event;
  setSelectedEvent: (event: Event) => void;
  openSubOrderDetailModal: () => void;
};

const SubOrderCard: React.FC<TSubOrderCardProps> = (props) => {
  const { event, setSelectedEvent, openSubOrderDetailModal } = props;
  const intl = useIntl();
  const { daySession, deliveryHour, status, orderColor, lastTransition } =
    event?.resource || {};

  const orderTitle = event?.title || '';
  const isFoodPicked = !!event.resource?.dishSelection?.dishSelection;
  const isNotJoined = status === EVENT_STATUS.NOT_JOINED_STATUS;
  const isExpired = isOver(event.resource?.expiredTime);
  const isExpiredToPickFood = isExpired && !isFoodPicked && !isNotJoined;
  const headerStyles = {
    backgroundColor: isExpiredToPickFood ? '#8C8C8C' : orderColor,
  };
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
          <OrderEventCardStatus
            status={status}
            lastTransition={lastTransition}
          />
        </div>
        <div className={css.orderInfo}>
          <OrderEventCardContentItems
            event={event}
            classNameCoverImage={css.coverImage}
            isFirstHighlight={status === EParticipantOrderStatus.empty}
          />
        </div>
      </div>
    </div>
  );
};

export default SubOrderCard;
