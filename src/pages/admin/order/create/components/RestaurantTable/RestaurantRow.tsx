import { InlineTextButton } from '@components/Button/Button';
import FieldRadioButton from '@components/FieldRadioButton/FieldRadioButton';
import classNames from 'classnames';
import get from 'lodash/get';

import css from './RestaurantTable.module.scss';

type TRestaurantRowProps = {
  rootClassName?: string;
  className?: string;
  restaurant: any;
};

const prepareDataForRestaurant = (restaurant: any) => {
  const { title, publicData } = get(restaurant, 'attributes', {});
  const { categories = [] } = publicData;
  return { title, categories };
};

const RestaurantRow: React.FC<TRestaurantRowProps> = (props) => {
  const { rootClassName, className, restaurant } = props;
  const itemClasses = classNames(rootClassName || css.item, className);
  const { title, categories } = prepareDataForRestaurant(restaurant);
  const categoriesContent = categories ? categories.join(', ') : [];

  return (
    <div className={css.row}>
      <FieldRadioButton
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
        <InlineTextButton className={css.seeMenuButton}>
          Xem menu
        </InlineTextButton>
      </div>
    </div>
  );
};

export default RestaurantRow;
