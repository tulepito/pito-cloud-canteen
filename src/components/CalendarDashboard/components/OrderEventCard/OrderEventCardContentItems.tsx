import type { Event } from 'react-big-calendar';
import { FormattedMessage } from 'react-intl';
import { DateTime } from 'luxon';

import IconClockWithExclamation from '@components/Icons/IconClock/IconClockWithExclamation';
import IconLocation from '@components/Icons/IconLocation/IconLocation';
import IconShop from '@components/Icons/IconShop/IconShop';
import { isOver } from '@helpers/orderHelper';

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
  const expiredTime = event.resource?.expiredTime;
  const isExpired = isOver(expiredTime);

  const remainTime = DateTime.fromJSDate(new Date()).diff(
    DateTime.fromMillis(+expiredTime),
    ['day', 'hour', 'minute', 'second'],
  );
  const remainDays = remainTime.get('day');
  const remainHours = remainTime.get('hour');
  const remainMinutes = remainTime.get('minute');

  return (
    <>
      {!isExpired && (
        <OrderEventCardContentItem
          icon={<IconClockWithExclamation />}
          isHighlight={isFirstHighlight}>
          <FormattedMessage
            id="EventCard.remainTime"
            values={{
              day: Math.abs(remainDays).toString().padStart(2, '0'),
              hour: Math.abs(remainHours).toString().padStart(2, '0'),
              minute: Math.abs(remainMinutes).toString().padStart(2, '0'),
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
