import IconClock from '@components/Icons/IconClock/IconClock';
import IconLocation from '@components/Icons/IconLocation/IconLocation';
import IconShop from '@components/Icons/IconShop/IconShop';
import { DateTime } from 'luxon';
import type { Event } from 'react-big-calendar';
import { FormattedMessage } from 'react-intl';

import OrderEventCardContentItem from './OrderEventCardContentItem';

export type TEventCardContentProps = {
  event: Event;
  isFirstHighlight?: boolean;
};

const EventCardContent: React.FC<TEventCardContentProps> = ({
  event,
  isFirstHighlight,
}) => {
  const deliAddress = event.resource?.deliveryAddress || '';

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
        <OrderEventCardContentItem
          icon={<IconClock />}
          isHighlight={isFirstHighlight}>
          <FormattedMessage
            id="EventCard.remainTime"
            values={{
              hour: Math.abs(remainHours),
              minute: Math.abs(remainMinutes),
            }}
          />
        </OrderEventCardContentItem>
      )}
      <OrderEventCardContentItem icon={<IconLocation />}>
        <FormattedMessage
          id="EventCard.deliveryAddress"
          values={{
            address: deliAddress.address,
          }}
        />
      </OrderEventCardContentItem>
      <OrderEventCardContentItem icon={<IconShop />}>
        {restaurantObj.name}
      </OrderEventCardContentItem>
    </>
  );
};

export default EventCardContent;
