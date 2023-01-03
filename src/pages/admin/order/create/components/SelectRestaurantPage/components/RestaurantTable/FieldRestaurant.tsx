import { InlineTextButton } from '@components/Button/Button';
import FieldRadioButton from '@components/FieldRadioButton/FieldRadioButton';
import { CATEGORY_OPTIONS } from '@utils/enums';
import classNames from 'classnames';
import get from 'lodash/get';
import { FormattedMessage } from 'react-intl';

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
          <FormattedMessage id="FieldRestaurant.viewMenu" />
        </InlineTextButton>
      </div>
    </div>
  );
};

export default FieldRestaurant;
