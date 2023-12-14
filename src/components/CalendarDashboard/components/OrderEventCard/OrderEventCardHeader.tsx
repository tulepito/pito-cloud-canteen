import type { Event } from 'react-big-calendar';
import { FormattedMessage, useIntl } from 'react-intl';

import { MORNING_SESSION } from '@components/CalendarDashboard/helpers/constant';
import { isOver } from '@src/utils/dates';
import { EParticipantOrderStatus } from '@src/utils/enums';

import css from './OrderEventCard.module.scss';

export type TOrderEventCardHeaderProps = {
  event: Event;
};

const OrderEventCardHeader: React.FC<TOrderEventCardHeaderProps> = ({
  event,
}) => {
  const intl = useIntl();
  const startTime = event.resource.deliveryHour;
  const {
    daySession = MORNING_SESSION,
    dishSelection,
    status,
  } = event.resource;
  const { orderColor } = event?.resource || {};
  const isFoodPicked = !!dishSelection?.dishSelection;
  const isExpired = isOver(event.resource?.expiredTime);
  const isNotJoined = status === EParticipantOrderStatus.notJoined;
  const isExpiredToPickFood = isExpired && !isFoodPicked && !isNotJoined;
  const headerStyles = {
    backgroundColor: isExpiredToPickFood ? '#8C8C8C' : orderColor,
  };

  return (
    <div className={css.eventCardHeader} style={headerStyles}>
      <div className={css.eventCardTitleWrapper}>
        <div className={css.eventTitle}>
          {intl.formatMessage({ id: `DayColumn.Session.${daySession}` })}
        </div>
        <div className={css.eventTime}>{startTime}</div>
      </div>
      <div className={css.orderId}>#{event.title}</div>
      <div className={css.mealType}>
        <FormattedMessage id={`EventCard.PCC`} />
      </div>
    </div>
  );
};

export default OrderEventCardHeader;
