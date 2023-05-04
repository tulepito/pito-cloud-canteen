import type { Event } from 'react-big-calendar';
import classNames from 'classnames';

import Tooltip from '@components/Tooltip/Tooltip';
import { isOver } from '@helpers/orderHelper';
import { MAX_MOBILE_SCREEN_WIDTH, useViewport } from '@hooks/useViewport';

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

const OrderEventCard: React.FC<TOrderEventCardProps> = ({ event }) => {
  const {
    viewport: { width },
  } = useViewport();
  const isMobile = width < MAX_MOBILE_SCREEN_WIDTH;
  const status = event.resource?.status;
  const isExpired = isOver(event.resource?.expiredTime);
  const eventStatus = isExpired ? EVENT_STATUS.EXPIRED_STATUS : status;
  const { orderColor } = event?.resource || {};
  const dotStyles = {
    backgroundColor: isExpired ? '#FAFAFA' : orderColor,
  };
  const cardStyles = {
    borderColor: isExpired ? '#FAFAFA' : orderColor,
  };

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
      trigger={isMobile ? '' : 'click'}
      overlayInnerStyle={{ backgroundColor: '#fff' }}>
      <div>
        <div
          className={classNames(css.root, {
            [css.rootExpired]: isExpired,
          })}
          style={cardStyles}>
          <OrderEventCardHeader event={event} />
          <div className={css.eventCardContentWrapper}>
            <OrderEventCardStatus
              className={css.cardStatus}
              status={eventStatus}
            />
            <OrderEventCardContentItems event={event} />
          </div>
        </div>
        <div className={css.dot} style={dotStyles}></div>
      </div>
    </Tooltip>
  );
};

export default OrderEventCard;
