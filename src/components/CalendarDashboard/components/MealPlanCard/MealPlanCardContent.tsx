import IconRefreshing from '@components/Icons/IconRefreshing/IconRefreshing';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import { EImageVariants } from '@utils/enums';
import type { Event } from 'react-big-calendar';

import css from './MealPlanCard.module.scss';

type TMealPlanCardContentProps = {
  event: Event;
  onEditMeal: (date: Date) => void;
};

const MealPlanCardContent: React.FC<TMealPlanCardContentProps> = ({
  event,
}) => {
  const restaurantName = event.resource?.restaurant?.name;
  const restaurantCoverImage = event.resource?.restaurant?.coverImage;

  return (
    <div className={css.content}>
      <div className={css.coverImg}>
        <ResponsiveImage
          alt={`${event.title}`}
          image={restaurantCoverImage}
          variants={[
            EImageVariants.landscapeCrop,
            EImageVariants.landscapeCrop2x,
          ]}
        />
      </div>
      <div className={css.restaurant}>
        <span title={restaurantName}>{restaurantName}</span>
        <IconRefreshing className={css.recommendRestaurant} />
      </div>
    </div>
  );
};

export default MealPlanCardContent;
