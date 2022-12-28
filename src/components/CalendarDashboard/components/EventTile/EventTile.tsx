import classNames from 'classnames';
import { DateTime } from 'luxon';
import type { Event } from 'react-big-calendar';
import { FormattedMessage } from 'react-intl';

import { EVENT_STATUS } from '../../helpers/constant';
import css from './EventTile.module.scss';
import EventTileContentItem from './EventTileContentItem';
import EventTileStatus from './EventTileStatus';

export type TEventTileProps = {
  event: Event;
  index: number;
};

const EventTile: React.FC<TEventTileProps> = ({ event, index }) => {
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
      <div className={css.eventTileHeader}>
        <div className={css.eventTileTitleWrapper}>
          <div className={css.eventTitle}>#{event.title}</div>
          <div className={css.eventTime}>{startTime}</div>
        </div>
        <div className={css.mealType}>
          <FormattedMessage id={`EventTile.mealType.${mealType}`} />
        </div>
      </div>
      <div className={css.eventTileContentWrapper}>
        <EventTileStatus
          status={isExpired ? EVENT_STATUS.EXPIRED_STATUS : status}
        />
        {!isExpired && (
          <EventTileContentItem>
            <FormattedMessage
              id="EventTile.remainTime"
              values={{
                hour: Math.abs(remainHours),
                minute: Math.abs(remainMinutes),
              }}
            />
          </EventTileContentItem>
        )}
        <EventTileContentItem>
          <FormattedMessage
            id="EventTile.deliveryAddress"
            values={{
              address: deliAddressObj.address,
              ward: deliAddressObj.ward,
              district: deliAddressObj.district,
              city: deliAddressObj.city,
            }}
          />
        </EventTileContentItem>
        <EventTileContentItem>{restaurantObj.name}</EventTileContentItem>
      </div>
    </div>
  );
};

export default EventTile;
