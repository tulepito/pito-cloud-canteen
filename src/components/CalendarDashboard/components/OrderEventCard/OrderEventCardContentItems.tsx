import type { Event } from 'react-big-calendar';
import { FormattedMessage } from 'react-intl';

import IconClockWithExclamation from '@components/Icons/IconClock/IconClockWithExclamation';
import IconLocation from '@components/Icons/IconLocation/IconLocation';
import IconShop from '@components/Icons/IconShop/IconShop';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { isOver } from '@helpers/orderHelper';
import { calculateRemainTime } from '@src/utils/dates';

import OrderEventCardContentItem from './OrderEventCardContentItem';

export type TEventCardContentProps = {
  event: Event;
  isFirstHighlight?: boolean;
};

const EventCardContent: React.FC<TEventCardContentProps> = ({
  event,
  isFirstHighlight,
}) => {
  const {
    restaurantAddress,
    expiredTime,
    isOrderStarted = false,
    restaurant: restaurantObj,
  } = event.resource || {};

  const shouldShowCountDown = !(isOver(expiredTime) || isOrderStarted);
  const remainTime = calculateRemainTime(new Date(expiredTime).getTime());

  return (
    <>
      <RenderWhen condition={shouldShowCountDown}>
        <OrderEventCardContentItem
          icon={<IconClockWithExclamation />}
          isHighlight={isFirstHighlight}>
          <span>Còn {remainTime} để chọn</span>
        </OrderEventCardContentItem>
      </RenderWhen>
      <OrderEventCardContentItem icon={<IconLocation />}>
        <FormattedMessage
          id="EventCard.deliveryAddress"
          values={{
            address: restaurantAddress,
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
