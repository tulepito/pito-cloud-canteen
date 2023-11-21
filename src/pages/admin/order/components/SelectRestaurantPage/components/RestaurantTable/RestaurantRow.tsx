import { useIntl } from 'react-intl';
import classNames from 'classnames';

import { useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@utils/data';
import type { TDefaultProps, TKeyValue } from '@utils/types';

import css from './RestaurantTable.module.scss';

type TRestaurantRowProps = TDefaultProps & {
  restaurant: any;
  onItemClick: () => void;
  disabledSelectRestaurant?: boolean;
};

const prepareDataForRestaurant = (restaurant: any) => {
  const { restaurantInfo, menu } = restaurant;
  const restaurantId = Listing(restaurantInfo).getId();
  const { title } = Listing(restaurantInfo).getAttributes();
  const { categories = [] } = Listing(restaurantInfo).getPublicData();
  const { menuType } = Listing(menu).getMetadata();

  return { restaurantId, title, categories, menuType };
};

const RestaurantRow: React.FC<TRestaurantRowProps> = (props) => {
  const intl = useIntl();
  const {
    rootClassName,
    className,
    restaurant,
    onItemClick,
    disabledSelectRestaurant = false,
  } = props;
  const categoryOptions = useAppSelector(
    (state) => state.SystemAttributes.categories,
  );

  const itemClasses = classNames(rootClassName || css.item, className);
  const { title, categories, menuType } = prepareDataForRestaurant(restaurant);
  const categoriesContent = categories
    ? categories
        .map((cat: string) => {
          const category = categoryOptions.find(
            (item: TKeyValue) => item.key === cat,
          );

          return category?.label || undefined;
        })
        .filter((item: string | undefined) => item)
        .join(', ')
    : [];

  const rowClasses = classNames(css.row, {
    [css.rowDisabled]: disabledSelectRestaurant,
  });

  return (
    <div className={rowClasses} onClick={onItemClick}>
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
