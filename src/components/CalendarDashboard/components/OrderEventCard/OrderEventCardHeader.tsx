import type { Event } from 'react-big-calendar';
import { FormattedMessage } from 'react-intl';

import css from './OrderEventCard.module.scss';

export type TOrderEventCardHeaderProps = {
  event: Event;
};

const OrderEventCardHeader: React.FC<TOrderEventCardHeaderProps> = ({
  event,
}) => {
  const mealType = event.resource?.type;
  const startTime = event.resource.deliveryHour;

  return (
    <div className={css.eventCardHeader}>
      <div className={css.eventCardTitleWrapper}>
        <div className={css.eventTitle}>#{event.title}</div>
        <div className={css.eventTime}>{startTime}</div>
      </div>
      <div className={css.mealType}>
        <FormattedMessage id={`EventCard.mealType.${mealType}`} />
      </div>
    </div>
  );
};

export default OrderEventCardHeader;
