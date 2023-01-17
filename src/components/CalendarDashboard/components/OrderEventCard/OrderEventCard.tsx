import Tooltip from '@components/Tooltip/Tooltip';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import type { Event } from 'react-big-calendar';

import { EVENT_STATUS } from '../../helpers/constant';
import css from './OrderEventCard.module.scss';
import OrderEventCardContentItems from './OrderEventCardContentItems';
import OrderEventCardHeader from './OrderEventCardHeader';
import OrderEventCardPopup from './OrderEventCardPopup';
import OrderEventCardStatus from './OrderEventCardStatus';

export type TOrderEventCardProps = {
  event: Event;
  index: number;
};

const OrderEventCard: React.FC<TOrderEventCardProps> = ({ event, index }) => {
  const status = event.resource?.status;

  const expiredTime = DateTime.fromJSDate(event.resource?.expiredTime)
    .plus({ day: 1 })
    .toJSDate();
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
        !isExpired && <OrderEventCardPopup event={event} status={eventStatus} />
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
        <OrderEventCardHeader event={event} />
        <div className={css.eventCardContentWrapper}>
          <OrderEventCardStatus
            className={css.cardStatus}
            status={eventStatus}
          />
          <OrderEventCardContentItems event={event} />
        </div>
      </div>
    </Tooltip>
  );
};

export default OrderEventCard;
