import type { Event } from 'react-big-calendar';
import classNames from 'classnames';

import Tooltip from '@components/Tooltip/Tooltip';
import { isOver } from '@helpers/orderHelper';

import { EVENT_STATUS } from '../../helpers/constant';

import OrderEventCardContentItems from './OrderEventCardContentItems';
import OrderEventCardHeader from './OrderEventCardHeader';
import OrderEventCardPopup from './OrderEventCardPopup';
import OrderEventCardStatus from './OrderEventCardStatus';

import css from './OrderEventCard.module.scss';

export type TOrderEventCardProps = {
  event: Event;
  index: number;
};

const OrderEventCard: React.FC<TOrderEventCardProps> = ({ event, index }) => {
  const status = event.resource?.status;
  const isExpired = isOver(event.resource?.expiredTime);
  const eventStatus = isExpired ? EVENT_STATUS.EXPIRED_STATUS : status;

  return (
    <Tooltip
      overlayClassName={css.tooltipOverlay}
      tooltipContent={
        <OrderEventCardPopup
          event={event}
          status={eventStatus}
          isExpired={isExpired}
        />
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
