import { FormattedMessage } from 'react-intl';

import IconAdd from '@components/Icons/IconAdd/IconAdd';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconClose from '@components/Icons/IconClose/IconClose';
import IconCloseWithCircle from '@components/Icons/IconCloseWithCircle/IconCloseWithCircle';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { Listing } from '@src/utils/data';
import { PARTNER_MENU_MEAL_TYPE_OPTIONS } from '@src/utils/enums';
import type { TObject } from '@src/utils/types';

import SelectFoodForMealModal from './SelectFoodForMeal/SelectFoodForMealModal';

import css from './MealSettings.module.scss';

const MAX_ITEM_TO_SHOW = 3;

type TMealSettingsProps = {
  foodListByMealAndDay: TObject;
  currentDay: string;
};

const MealSettingItem = ({
  pickedFood = [],
  foodList = [],
  meal,
  mealLabel,
}: any) => {
  const expandControl = useBoolean(true);
  const isEmptyFoodList = foodList.length === 0;
  const isOverMaxItemsToShow = foodList.length > MAX_ITEM_TO_SHOW;
  const showMoreControl = useBoolean(isOverMaxItemsToShow);
  const addFoodControl = useBoolean();

  const foodListToRender =
    isOverMaxItemsToShow && showMoreControl.value
      ? foodList.slice(0, 3)
      : foodList;

  return (
    <div className={css.mealContainer} key={meal}>
      <div className={css.mealHeadContainer}>
        <div>
          <IconCloseWithCircle />
          <span>
            {mealLabel} {isEmptyFoodList ? '' : `(${foodList.length})`}
          </span>
        </div>

        <IconArrow
          direction={expandControl.value ? 'up' : 'down'}
          onClick={expandControl.toggle}
        />
      </div>

      <RenderWhen condition={expandControl.value}>
        <div className={css.foodContainer}>
          {foodListToRender.map((data: TObject) => {
            const { sideDishes = [], id } = data as TObject;

            const foodListingMaybe = pickedFood.find(
              (f: TObject) => f.id.uuid === id,
            );

            const { title } = Listing(foodListingMaybe).getAttributes();

            return (
              <div key={id} className={css.pickedFoodItem}>
                <div className={css.foodTitle}>
                  <div>{title}</div>

                  <div className={css.deleteFoodBtn}>
                    <IconClose />
                  </div>
                </div>
                {sideDishes.length > 0 && (
                  <div className={css.sideDishesContent}>
                    <FormattedMessage
                      id="FoodEventCard.sideDishesContent"
                      values={{
                        boldText: (
                          <span className={css.boldText}>
                            <FormattedMessage id="FoodEventCard.sideDishesLabel" />
                          </span>
                        ),
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className={css.actionContainer}>
          <div className={css.addFoodBtn} onClick={addFoodControl.setTrue}>
            <IconAdd />
            <div>Thêm món ăn</div>
          </div>

          <RenderWhen condition={!isEmptyFoodList}>
            <div className={css.applyFoodBtn}>
              Áp dụng món cho các thứ còn lại
            </div>
          </RenderWhen>
        </div>

        <RenderWhen condition={isOverMaxItemsToShow}>
          <div className={css.showMoreContainer}>
            <IconArrow
              direction={showMoreControl.value ? 'double-down' : 'double-up'}
              onClick={showMoreControl.toggle}
            />
          </div>
        </RenderWhen>
      </RenderWhen>

      <SelectFoodForMealModal
        isOpen={addFoodControl.value}
        onClose={addFoodControl.setFalse}
      />
    </div>
  );
};

const MealSettings: React.FC<TMealSettingsProps> = (props) => {
  const { currentDay, foodListByMealAndDay = {} } = props;
  const pickedFood = useAppSelector(
    (state) => state.PartnerManageMenus.pickedFood,
  );

  const foodListByMealOfDay = foodListByMealAndDay[currentDay] || [];

  return (
    <div className={css.root}>
      {foodListByMealOfDay?.map(
        ({ meal, foodList: foodMap = {} }: TObject, index: number) => {
          const mealLabel = PARTNER_MENU_MEAL_TYPE_OPTIONS.find(
            ({ key }) => key === meal,
          )?.label;

          const foodList = Object.values(foodMap);

          return (
            <MealSettingItem
              key={`${currentDay}.${meal}.${index}`}
              meal={meal}
              mealLabel={mealLabel}
              pickedFood={pickedFood}
              foodList={foodList}
            />
          );
        },
      )}
    </div>
  );
};

export default MealSettings;
