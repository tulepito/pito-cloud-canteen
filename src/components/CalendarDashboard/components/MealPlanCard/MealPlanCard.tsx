import type { Event } from 'react-big-calendar';

import css from './MealPlanCard.module.scss';
import MealPlanCardContent from './MealPlanCardContent';
import MealPlanCardFooter from './MealPlanCardFooter';
import MealPlanCardHeader from './MealPlanCardHeader';

type TMealPlanCardProps = {
  event: Event;
  index: number;
};

const MealPlanCard: React.FC<TMealPlanCardProps> = ({ event }) => {
  return (
    <div className={css.root}>
      <MealPlanCardHeader event={event} />
      <MealPlanCardContent event={event} />
      <MealPlanCardFooter event={event} />
    </div>
  );
};

export default MealPlanCard;
