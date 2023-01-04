import IconRefreshing from '@components/Icons/IconRefreshing';
import Image from 'next/image';
import type { Event } from 'react-big-calendar';
import { FormattedMessage } from 'react-intl';

import coverImg from '../../../../assets/mealPlanCover.png';
import css from './MealPlanCard.module.scss';

type TMealPlanCardContentProps = {
  event: Event;
};

const MealPlanCardContent: React.FC<TMealPlanCardContentProps> = ({
  event,
}) => {
  const restaurantName = event.resource?.restaurant?.name;
  return (
    <div className={css.content}>
      <Image className={css.coverImg} alt={`${event.title}`} src={coverImg} />
      <div className={css.restaurant}>
        <span>{restaurantName}</span>
        <IconRefreshing className={css.recommendRestaurant} />
      </div>
      <div className={css.viewMenu}>
        <FormattedMessage id="MealPlanCard.content.viewMenu" />
      </div>
    </div>
  );
};

export default MealPlanCardContent;
