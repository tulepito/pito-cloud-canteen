import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import { Listing } from '@src/utils/data';
import {
  EFoodTypes,
  EImageVariants,
  FOOD_TYPE_OPTIONS,
} from '@src/utils/enums';
import type { TListing, TObject } from '@src/utils/types';

import css from './FoodCard.module.scss';

type TFoodCardProps = { data: TObject };

const FoodCard: React.FC<TFoodCardProps> = ({ data }) => {
  const foodGetter = Listing(data as TListing);
  const { title } = foodGetter.getAttributes();
  const { foodType = EFoodTypes.savoryDish } = foodGetter.getPublicData();
  const foodId = foodGetter.getId();
  const foodImage = foodGetter.getImages()[0] || null;
  const foodTypeLabel =
    FOOD_TYPE_OPTIONS.find(({ key }) => foodType === key)?.label ||
    FOOD_TYPE_OPTIONS[1].label;

  return (
    <div className={css.root}>
      <div className={css.foodImgContainer}>
        <ResponsiveImage
          className={css.foodImg}
          alt={`Food${foodId}`}
          image={foodImage}
          variants={[EImageVariants.squareSmall2x]}
          // sizes={'48px'}
        />
      </div>
      <div className={css.infoContainer}>
        <div className={css.foodTitle}>{title}</div>
        <div className={css.badge}>{foodTypeLabel}</div>
      </div>
    </div>
  );
};

export default FoodCard;
