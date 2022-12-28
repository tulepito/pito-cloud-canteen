import IconClock from '@components/Icons/IconClock';
import IconLocation from '@components/Icons/IconLocation';
import IconShop from '@components/Icons/IconShop';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import type { Event } from 'react-big-calendar';
import { FormattedMessage } from 'react-intl';

import { EVENT_STATUS } from '../../helpers/constant';
import css from './EventCard.module.scss';
import EventCardContentItem from './EventCardContentItem';
import EventCardStatus from './EventCardStatus';

export type TEventCardProps = {
  event: Event;
  index: number;
};

const EventCard: React.FC<TEventCardProps> = ({ event, index }) => {
  const status = event.resource?.status;
  const mealType = event.resource?.type;
  const startTime = event.start
    ? DateTime.fromJSDate(event.start).toLocaleString(DateTime.TIME_24_SIMPLE)
    : null;
  const deliAddressObj = event.resource?.deliveryAddress || {};
  const restaurantObj = event.resource?.restaurant || {};
  const expiredTime = event.resource?.expiredTime as Date;
  const remainTime = DateTime.fromJSDate(new Date()).diff(
    DateTime.fromJSDate(expiredTime),
    ['hour', 'minute', 'second'],
  );
  const remainHours = remainTime.get('hour');
  const remainMinutes = remainTime.get('minute');
  const isExpired = remainHours > 0 && remainMinutes > 0;

  return (
    <div
      className={classNames(css.root, {
        [css.rootExpired]: isExpired,
        [css.rootBlue]: !isExpired && index % 2 === 1,
        [css.rootOrange]: !isExpired && index % 2 === 0,
      })}>
      <div className={css.eventCardHeader}>
        <div className={css.eventCardTitleWrapper}>
          <div className={css.eventTitle}>#{event.title}</div>
          <div className={css.eventTime}>{startTime}</div>
        </div>
        <div className={css.mealType}>
          <FormattedMessage id={`EventCard.mealType.${mealType}`} />
        </div>
      </div>
      <div className={css.eventCardContentWrapper}>
        <EventCardStatus
          status={isExpired ? EVENT_STATUS.EXPIRED_STATUS : status}
        />
        {!isExpired && (
          <EventCardContentItem icon={<IconClock />}>
            <FormattedMessage
              id="EventCard.remainTime"
              values={{
                hour: Math.abs(remainHours),
                minute: Math.abs(remainMinutes),
              }}
            />
          </EventCardContentItem>
        )}
        <EventCardContentItem icon={<IconLocation />}>
          <FormattedMessage
            id="EventCard.deliveryAddress"
            values={{
              address: deliAddressObj.address,
              ward: deliAddressObj.ward,
              district: deliAddressObj.district,
              city: deliAddressObj.city,
            }}
          />
        </EventCardContentItem>
        <EventCardContentItem icon={<IconShop />}>
          {restaurantObj.name}
        </EventCardContentItem>
      </div>
    </div>
  );
};

export default EventCard;
