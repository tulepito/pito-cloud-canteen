import type { Event } from 'react-big-calendar';
import classNames from 'classnames';

import IconRefreshing from '@components/Icons/IconRefreshing/IconRefreshing';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import { EImageVariants } from '@utils/enums';

import css from './MealPlanCard.module.scss';

type TMealPlanCardContentProps = {
  event: Event;
  onRecommendMeal?: (date: number) => void;
  onRecommendMealInProgress?: boolean;
  restaurantAvailable?: boolean;
};

const MealPlanCardContent: React.FC<TMealPlanCardContentProps> = ({
  event,
  onRecommendMeal,
  onRecommendMealInProgress,
  restaurantAvailable = true,
}) => {
  const restaurantName = event.resource?.restaurant?.name;
  const restaurantCoverImage = event.resource?.restaurant?.coverImage;

  const handleRefreshIconClick = () => {
    if (onRecommendMealInProgress) return;
    onRecommendMeal?.(event?.start?.getTime()!);
  };

  return (
    <div
      className={classNames(css.content, !restaurantAvailable && css.disable)}>
      <div className={css.coverImg}>
        <ResponsiveImage
          alt={`${restaurantName}`}
          image={restaurantCoverImage}
          variants={[
            EImageVariants.landscapeCrop,
            EImageVariants.landscapeCrop2x,
          ]}
        />
      </div>
      <div className={css.restaurant}>
        <span title={restaurantName}>{restaurantName}</span>
        <IconRefreshing
          className={css.recommendRestaurant}
          onClick={handleRefreshIconClick}
          inProgress={onRecommendMealInProgress}
          data-tour="step-2"
        />
      </div>
    </div>
  );
};

export default MealPlanCardContent;
