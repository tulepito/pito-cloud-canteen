import type { Event } from 'react-big-calendar';

import SubOrderBadge from '@components/SubOrderBadge/SubOrderBadge';

import css from './SubOrderEventCard.module.scss';

type TSubOrderEventCardProps = {
  event: Event;
};

const SubOrderEventCard: React.FC<TSubOrderEventCardProps> = (props) => {
  const { event } = props;
  const { subOrderTitle, deliveryHour, lastTransition } = event.resource || {};

  return (
    <div className={css.root}>
      <div className={css.leftPart}>
        <div className={css.greenMark}> </div>
        <div className={css.title}>#{subOrderTitle}</div>•
        <div className={css.deliveryHour}>{deliveryHour}</div>
      </div>
      <div className={css.rightPart}>
        <SubOrderBadge lastTransition={lastTransition} />
      </div>
    </div>
  );
};

export default SubOrderEventCard;
