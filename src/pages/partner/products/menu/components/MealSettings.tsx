import { FormattedMessage } from 'react-intl';
import omit from 'lodash/omit';

import Alert, { EAlertPosition, EAlertType } from '@components/Alert/Alert';
import IconAdd from '@components/Icons/IconAdd/IconAdd';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconClose from '@components/Icons/IconClose/IconClose';
import IconCloseWithCircle from '@components/Icons/IconCloseWithCircle/IconCloseWithCircle';
import AlertModal from '@components/Modal/AlertModal';
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
  foodByDate: TObject;
  isDraftEditFlow: boolean;
  saveDraftFoodByDate: (value: TObject) => void;
};

const MealSettingItem = ({
  pickedFood = [],
  foodList = [],
  meal,
  isDraftEditFlow,
  currentDay,
  foodByDate,
  saveDraftFoodByDate,
  mealLabel,
}: any) => {
  const isEmptyFoodList = foodList.length === 0;
  const expandControl = useBoolean(isEmptyFoodList);
  const isOverMaxItemsToShow = foodList.length > MAX_ITEM_TO_SHOW;
  const showMoreControl = useBoolean(true);
  const addFoodControl = useBoolean();
  const addFoodSuccessControl = useBoolean();
  const confirmDeleteMealControl = useBoolean();
  const lowerCaseMealName = mealLabel.toLowerCase();

  const foodListToRender =
    isOverMaxItemsToShow && showMoreControl.value
      ? foodList.slice(0, 3)
      : foodList;

  const currentFoodIds = foodList.map((f: TObject) => f.id);

  const handleClickDeleteMeal = () => {
    confirmDeleteMealControl.setTrue();
  };

  const handleDeleteMeal = () => {
    let newFoodByDate = foodByDate;

    if (isDraftEditFlow) {
      if (foodByDate[meal] && foodByDate[meal][currentDay]) {
        newFoodByDate = {
          ...foodByDate,
          [meal]: omit(foodByDate[meal], [currentDay]),
        };
      }
    } else if (foodByDate[currentDay]) {
      newFoodByDate = omit(foodByDate, [currentDay]);
    }

    saveDraftFoodByDate(newFoodByDate);
  };

  return (
    <div className={css.mealContainer} key={meal}>
      <div className={css.mealHeadContainer}>
        <div>
          <IconCloseWithCircle onClick={handleClickDeleteMeal} />
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

      {meal && addFoodControl.value && (
        <SelectFoodForMealModal
          meal={meal}
          isOpen={addFoodControl.value}
          onClose={addFoodControl.setFalse}
          onOpen={addFoodControl.setTrue}
          isDraftEditFlow={isDraftEditFlow}
          currentDay={currentDay}
          foodByDate={foodByDate}
          saveDraftFoodByDate={saveDraftFoodByDate}
          currentFoodIds={currentFoodIds}
          turnOnSuccessAddFoodAlert={addFoodSuccessControl.setTrue}
        />
      )}

      <Alert
        className={css.addFoodSuccess}
        openClassName={css.addFoodSuccessOpen}
        message={'Thêm món thành công'}
        isOpen={addFoodSuccessControl.value}
        onClose={addFoodSuccessControl.setFalse}
        autoClose
        hasCloseButton={false}
        type={EAlertType.success}
        position={EAlertPosition.bottom}
      />

      <AlertModal
        isOpen={confirmDeleteMealControl.value}
        title={`Xóa ${lowerCaseMealName}`}
        shouldFullScreenInMobile={false}
        containerClassName={css.confirmDeleteMenuModal}
        handleClose={confirmDeleteMealControl.setFalse}
        cancelLabel={'Huỷ'}
        confirmLabel={`Xóa ${lowerCaseMealName}`}
        onCancel={confirmDeleteMealControl.setFalse}
        onConfirm={handleDeleteMeal}
        actionsClassName={css.confirmDeleteModalAction}>
        <div className={css.menuDescription}>
          Bạn có chắc chắn muốn xoá{' '}
          <span className={css.mealName}>{lowerCaseMealName}</span> không?
        </div>
      </AlertModal>
    </div>
  );
};

const MealSettings: React.FC<TMealSettingsProps> = (props) => {
  const {
    currentDay,
    foodListByMealAndDay = {},
    foodByDate,
    isDraftEditFlow,
    saveDraftFoodByDate,
  } = props;
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
              isDraftEditFlow={isDraftEditFlow}
              currentDay={currentDay}
              foodByDate={foodByDate}
              saveDraftFoodByDate={saveDraftFoodByDate}
            />
          );
        },
      )}
    </div>
  );
};

export default MealSettings;
