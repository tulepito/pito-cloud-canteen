import { CATEGORY_OPTIONS } from '@utils/enums';
import classNames from 'classnames';
import get from 'lodash/get';

import css from './RestaurantTable.module.scss';

type TRestaurantRowProps = {
  rootClassName?: string;
  className?: string;
  restaurant: any;
  onItemClick: () => void;
};

const prepareDataForRestaurant = (restaurant: any) => {
  const restaurantId = restaurant?.id?.uuid;
  const { title, publicData } = get(restaurant, 'attributes', {});
  const { categories = [] } = publicData;
  return { restaurantId, title, categories };
};

const RestaurantRow: React.FC<TRestaurantRowProps> = (props) => {
  const { rootClassName, className, restaurant, onItemClick } = props;
  const itemClasses = classNames(rootClassName || css.item, className);
  const { title, categories } = prepareDataForRestaurant(restaurant);
  const categoriesContent = categories
    ? categories
        .map((cat: string) => {
          const category = CATEGORY_OPTIONS.find((item) => item.key === cat);
          return category?.label || undefined;
        })
        .filter((item: string | undefined) => item)
        .join(', ')
    : [];

  return (
    <div className={css.row} onClick={onItemClick}>
      <div className={itemClasses}>
        <div>{title}</div>
        <div></div>
        <div>{categoriesContent}</div>
        <div></div>
      </div>
    </div>
  );
};

export default RestaurantRow;
