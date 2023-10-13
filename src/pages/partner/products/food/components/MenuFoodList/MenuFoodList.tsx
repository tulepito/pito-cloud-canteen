import { useIntl } from 'react-intl';
import classNames from 'classnames';

import IconClose from '@components/Icons/IconClose/IconClose';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import type { TObject } from '@src/utils/types';

import css from './MenuFoodList.module.scss';

type TMenuFoodListProps = {
  menuDaySession: string;
  foodList: TObject;
  newFoodItem: TObject;
  onNewFoodItemDelete?: () => void;
  containerClassName?: string;
};

const MenuFoodList: React.FC<TMenuFoodListProps> = (props) => {
  const { menuDaySession, foodList, newFoodItem, containerClassName } = props;
  const intl = useIntl();
  const foodNumber = Object.keys(foodList).length;

  const classes = classNames(css.root, containerClassName);
  const isNewFoodExistInFoodList = Object.values(foodList).some(
    (food: any) => food.id === newFoodItem.id,
  );

  return (
    <div className={classes}>
      <div className={css.header}>
        {intl.formatMessage({ id: `MenuMealType.label.${menuDaySession}` })}
        {` (${isNewFoodExistInFoodList ? foodNumber : foodNumber + 1})`}
      </div>
      <div className={css.foodList}>
        {Object.values(foodList).map((food: any) => {
          return (
            <div key={food.id} className={css.foodItem}>
              <div className={css.name}>{food.title}</div>
              <RenderWhen
                condition={!!food.sideDishes && food.sideDishes.length > 0}>
                <div className={css.sideDishWrapper}>
                  có <span className={css.sideDish}>Món ăn kèm</span>
                </div>
              </RenderWhen>
            </div>
          );
        })}
        <RenderWhen condition={!isNewFoodExistInFoodList}>
          <div className={classNames(css.foodItem, css.new)}>
            <div className={css.name}>{newFoodItem.title}</div>
            <RenderWhen condition={newFoodItem?.sideDishes.length > 0}>
              <div className={css.sideDishWrapper}>
                có <span className={css.sideDish}>Món ăn kèm</span>
              </div>
            </RenderWhen>
            <IconClose className={css.iconClose} />
          </div>
        </RenderWhen>
      </div>
    </div>
  );
};

export default MenuFoodList;
