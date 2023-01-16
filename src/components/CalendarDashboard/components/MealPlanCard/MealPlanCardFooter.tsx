import type { Event } from 'react-big-calendar';

import css from './MealPlanCard.module.scss';

type TMealPlanCardFooterProps = {
  event: Event;
};

const MealPlanCardFooter: React.FC<TMealPlanCardFooterProps> = () => {
  return (
    <div className={css.footer}>
      {/* <Button className={css.unselectBtn}>
        <FormattedMessage id="MealPlanCard.footer.unselect" />
      </Button>
      <div className={css.applyForOtherDays}>
        <FormattedMessage id="MealPlanCard.footer.applyForOtherDays" />
      </div> */}
    </div>
  );
};

export default MealPlanCardFooter;
