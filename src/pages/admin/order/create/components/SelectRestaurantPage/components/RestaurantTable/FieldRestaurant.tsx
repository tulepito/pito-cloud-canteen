import { InlineTextButton } from '@components/Button/Button';
import FieldRadioButton from '@components/FieldRadioButton/FieldRadioButton';
import classNames from 'classnames';
import get from 'lodash/get';

import css from './RestaurantTable.module.scss';

type TFieldRestaurantProps = {
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

const FieldRestaurant: React.FC<TFieldRestaurantProps> = (props) => {
  const { rootClassName, className, restaurant, onItemClick } = props;
  const itemClasses = classNames(rootClassName || css.item, className);
  const { restaurantId, title, categories } =
    prepareDataForRestaurant(restaurant);
  const categoriesContent = categories ? categories.join(', ') : [];

  return (
    <div className={css.row}>
      <FieldRadioButton
        id={restaurantId as string}
        value={restaurantId as string}
        svgClassName={css.radioSvg}
        radioLabelClassName={css.radioLabel}
        radioButtonWrapperClassName={css.radioButtonWrapper}
        name="restaurant"
      />
      <div className={itemClasses}>
        <div>{title}</div>
        <div>{categoriesContent}</div>
        <div></div>
        <div></div>
        <InlineTextButton className={css.seeMenuButton} onClick={onItemClick}>
          Xem menu
        </InlineTextButton>
      </div>
    </div>
  );
};

export default FieldRestaurant;
