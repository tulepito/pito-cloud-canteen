import Tooltip from '@components/Tooltip/Tooltip';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import type { Event } from 'react-big-calendar';

import { EVENT_STATUS } from '../../helpers/constant';
import css from './EventCard.module.scss';
import EventCardContentItems from './EventCardContentItems';
import EventCardHeader from './EventCardHeader';
import EventCardPopup from './EventCardPopup';
import EventCardStatus from './EventCardStatus';

export type TEventCardProps = {
  event: Event;
  index: number;
};

const EventCard: React.FC<TEventCardProps> = ({ event, index }) => {
  const status = event.resource?.status;

  const expiredTime = event.resource?.expiredTime as Date;
  const remainTime = DateTime.fromJSDate(new Date()).diff(
    DateTime.fromJSDate(expiredTime),
    ['hour', 'minute', 'second'],
  );
  const remainHours = remainTime.get('hour');
  const remainMinutes = remainTime.get('minute');
  const isExpired = remainHours > 0 && remainMinutes > 0;
  const eventStatus = isExpired ? EVENT_STATUS.EXPIRED_STATUS : status;

  return (
    <Tooltip
      overlayClassName={css.tooltipOverlay}
      tooltipContent={
        !isExpired && <EventCardPopup event={event} status={eventStatus} />
      }
      placement="rightTop"
      trigger="click"
      overlayInnerStyle={{ backgroundColor: '#fff' }}>
      <div
        className={classNames(css.root, {
          [css.rootExpired]: isExpired,
          [css.rootBlue]: !isExpired && index % 2 === 1,
          [css.rootOrange]: !isExpired && index % 2 === 0,
        })}>
        <EventCardHeader event={event} />
        <div className={css.eventCardContentWrapper}>
          <EventCardStatus className={css.cardStatus} status={eventStatus} />
          <EventCardContentItems event={event} />
        </div>
      </div>
    </Tooltip>
  );
};

export default EventCard;
