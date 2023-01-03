import IconClock from '@components/Icons/IconClock';
import IconLocation from '@components/Icons/IconLocation';
import IconShop from '@components/Icons/IconShop';
import { DateTime } from 'luxon';
import type { Event } from 'react-big-calendar';
import { FormattedMessage } from 'react-intl';

import EventCardContentItem from './EventCardContentItem';

export type TEventCardContentProps = {
  event: Event;
};

const EventCardContent: React.FC<TEventCardContentProps> = ({ event }) => {
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
    <>
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
    </>
  );
};

export default EventCardContent;
