import type { Event } from 'react-big-calendar';
import { FormattedMessage } from 'react-intl';

import IconClockWithExclamation from '@components/Icons/IconClock/IconClockWithExclamation';
import IconDish from '@components/Icons/IconDish/IconDish';
import IconLocation from '@components/Icons/IconLocation/IconLocation';
import IconShop from '@components/Icons/IconShop/IconShop';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { isOver } from '@helpers/orderHelper';
import { calculateRemainTime } from '@src/utils/dates';
import { EOrderStates, EParticipantOrderStatus } from '@src/utils/enums';

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
    restaurant: restaurantObj,
    expiredTime,

    isOrderStarted = false,
    foodName,
    status,
    orderState,
  } = event?.resource || {};

  const isExpired = isOver(expiredTime);
  const remainTime = calculateRemainTime(new Date(expiredTime).getTime());
  const shouldShowCountdown = !isExpired && !isOrderStarted;

  return (
    <>
      <RenderWhen
        condition={
          status === EParticipantOrderStatus.joined &&
          orderState === EOrderStates.picking
        }>
        <OrderEventCardContentItem
          icon={<IconDish />}
          isHighlight={isFirstHighlight}>
          <span>{foodName}</span>
        </OrderEventCardContentItem>
      </RenderWhen>

      <RenderWhen condition={shouldShowCountdown}>
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
