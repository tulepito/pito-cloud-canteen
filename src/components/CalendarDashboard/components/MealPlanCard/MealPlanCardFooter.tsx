import Button from '@components/Button/Button';
import type { Event } from 'react-big-calendar';
import { FormattedMessage } from 'react-intl';

import css from './MealPlanCard.module.scss';

type TMealPlanCardFooterProps = {
  event: Event;
};

const MealPlanCardFooter: React.FC<TMealPlanCardFooterProps> = ({ event }) => {
  const foodList = event.resource.foodList || [];
  return (
    <div className={css.footer}>
      {foodList.length > 0 ? (
        <Button className={css.actionButton}>
          <FormattedMessage id="MealPlanCard.footer.modify" />
        </Button>
      ) : (
        <Button className={css.actionButton}>
          <FormattedMessage id="MealPlanCard.footer.selectDish" />
        </Button>
      )}
      <div className={css.applyForOtherDays}>
        <FormattedMessage id="MealPlanCard.footer.applyForOtherDays" />
      </div>
    </div>
  );
};

export default MealPlanCardFooter;
