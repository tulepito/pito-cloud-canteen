import type { Event } from 'react-big-calendar';
import { FormattedMessage } from 'react-intl';

import { EVENT_STATUS } from '@components/CalendarDashboard/helpers/constant';
import IconBanned from '@components/Icons/IconBanned/IconBanned';
import IconClockWithExclamation from '@components/Icons/IconClock/IconClockWithExclamation';
import IconDish from '@components/Icons/IconDish/IconDish';
import IconLocation from '@components/Icons/IconLocation/IconLocation';
import IconShop from '@components/Icons/IconShop/IconShop';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import { Listing } from '@src/utils/data';
import { calculateRemainTime, isOver } from '@src/utils/dates';
import { EImageVariants, EParticipantOrderStatus } from '@src/utils/enums';

import OrderEventCardContentItem from './OrderEventCardContentItem';

export type TEventCardContentProps = {
  event: Event;
  isFirstHighlight?: boolean;
  classNameCoverImage: string;
};

const EventCardContent: React.FC<TEventCardContentProps> = ({
  event,
  classNameCoverImage,
  isFirstHighlight,
}) => {
  const {
    restaurantAddress,
    restaurant: restaurantObj,
    expiredTime,
    isOrderStarted = false,
    foodName,
    status,
    pickedFoodDetail,
  } = event?.resource || {};

  const isExpired = isOver(expiredTime);
  const remainTime = calculateRemainTime(new Date(expiredTime).getTime());
  const shouldShowCountdown = !isExpired && !isOrderStarted;
  const shouldShowRejectButton = [EVENT_STATUS.NOT_JOINED_STATUS].includes(
    status,
  );

  const image = Listing(pickedFoodDetail).getImages()[0];

  const showCoverImage = [EParticipantOrderStatus.joined].includes(status);

  return (
    <>
      <RenderWhen condition={showCoverImage}>
        <div className={classNameCoverImage}>
          <ResponsiveImage
            alt="foodPicked"
            image={image}
            variants={[EImageVariants.default]}
            emptyType="food"
          />
        </div>
      </RenderWhen>

      <RenderWhen condition={status === EParticipantOrderStatus.joined}>
        <OrderEventCardContentItem icon={<IconDish />}>
          <span>{foodName}</span>
        </OrderEventCardContentItem>
      </RenderWhen>

      <RenderWhen condition={shouldShowRejectButton}>
        <OrderEventCardContentItem icon={<IconBanned />}>
          <span>Bỏ chọn ngày này</span>
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
