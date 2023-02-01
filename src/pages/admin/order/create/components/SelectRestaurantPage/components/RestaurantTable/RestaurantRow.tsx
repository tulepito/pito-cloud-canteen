import { LISTING } from '@utils/data';
import { CATEGORY_OPTIONS } from '@utils/enums';
import classNames from 'classnames';
import { useIntl } from 'react-intl';

import css from './RestaurantTable.module.scss';

type TRestaurantRowProps = {
  rootClassName?: string;
  className?: string;
  restaurant: any;
  onItemClick: () => void;
};

const prepareDataForRestaurant = (restaurant: any) => {
  const { restaurantInfo, menu } = restaurant;
  const restaurantId = LISTING(restaurantInfo).getId();
  const { title } = LISTING(restaurantInfo).getAttributes();
  const { categories = [] } = LISTING(restaurantInfo).getPublicData();
  const { menuType } = LISTING(menu).getMetadata();
  return { restaurantId, title, categories, menuType };
};

const RestaurantRow: React.FC<TRestaurantRowProps> = (props) => {
  const intl = useIntl();
  const { rootClassName, className, restaurant, onItemClick } = props;
  const itemClasses = classNames(rootClassName || css.item, className);
  const { title, categories, menuType } = prepareDataForRestaurant(restaurant);
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
        <div>
          {intl.formatMessage({ id: `RestaurantRow.menu.${menuType}` })}
        </div>
        <div>{categoriesContent}</div>
        <div></div>
      </div>
    </div>
  );
};

export default RestaurantRow;
