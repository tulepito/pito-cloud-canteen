import { useIntl } from 'react-intl';
import classNames from 'classnames';

import IconClose from '@components/Icons/IconClose/IconClose';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import type { TObject } from '@src/utils/types';

import css from './MenuFoodList.module.scss';

type TMenuFoodListProps = {
  menuDaySession: string;
  foodList: TObject;
  onNewFoodItemDelete?: () => void;
  containerClassName?: string;
  handleFoodRemoveClick: () => void;
  selectedFoodId: string;
};

const MenuFoodList: React.FC<TMenuFoodListProps> = (props) => {
  const {
    menuDaySession,
    foodList,
    containerClassName,
    handleFoodRemoveClick,
    selectedFoodId,
  } = props;
  const intl = useIntl();
  const foodNumber = Object.keys(foodList).length;

  const classes = classNames(css.root, containerClassName);

  return (
    <div className={classes}>
      <div className={css.header}>
        {intl.formatMessage({ id: `MenuMealType.label.${menuDaySession}` })}
        {` (${foodNumber})`}
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
              <RenderWhen condition={food.id === selectedFoodId}>
                <IconClose
                  className={css.iconClose}
                  onClick={handleFoodRemoveClick}
                />
              </RenderWhen>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MenuFoodList;
