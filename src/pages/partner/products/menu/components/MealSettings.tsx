/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import difference from 'lodash/difference';
import isEmpty from 'lodash/isEmpty';
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
import { EFoodApprovalState } from '@src/utils/enums';
import { PARTNER_MENU_MEAL_TYPE_OPTIONS } from '@src/utils/options';
import type { TListing, TObject } from '@src/utils/types';

import SelectFoodForMealModal from './SelectFoodForMeal/SelectFoodForMealModal';
import ApplyForAnotherDayForm from './ApplyForAnotherDayForm';

import css from './MealSettings.module.scss';

const MAX_ITEM_TO_SHOW = 3;

type TMealSettingsProps = {
  foodListByMealAndDay: TObject;
  currentDay: string;
  foodByDate: TObject;
  isDraftEditFlow: boolean;
  daysOfWeek?: string[];
  saveDraftFoodByDate: (value: TObject) => void;
};

const MealSettingItem = ({
  pickedFood = [],
  foodList = [],
  meal,
  isFirst,
  isDraftEditFlow,
  currentDay,
  foodByDate,
  saveDraftFoodByDate,
  mealLabel,
  daysOfWeek,
}: any) => {
  const isEmptyFoodList = foodList.length === 0;
  const expandControl = useBoolean(isFirst || isEmptyFoodList);
  const showMoreControl = useBoolean(true);
  const addFoodControl = useBoolean();
  const addFoodSuccessControl = useBoolean();
  const applyFoodForAnotherDayControl = useBoolean();
  const confirmDeleteMealControl = useBoolean();
  const confirmApplyForAnotherDayControl = useBoolean();
  const selectAllDaysControl = useBoolean();
  const lowerCaseMealName = mealLabel.toLowerCase();
  const createDraftMenuInProgress = useAppSelector(
    (state) => state.PartnerManageMenus.createDraftMenuInProgress,
  );
  const updateDraftMenuInProgress = useAppSelector(
    (state) => state.PartnerManageMenus.updateDraftMenuInProgress,
  );

  const publishDraftMenuInProgress = useAppSelector(
    (state) => state.PartnerManageMenus.publishDraftMenuInProgress,
  );
  const [daysToApply, setDaysToApply] = useState<string[]>([]);
  const foodListIds = useMemo(
    () => foodList.map((f: TObject) => f.id),
    [JSON.stringify(foodList)],
  );
  const foodListingByDay = useMemo(
    () => pickedFood.filter((f: TListing) => foodListIds.includes(f.id.uuid)),
    [JSON.stringify(pickedFood), JSON.stringify(foodListIds)],
  );
  const acceptedFoodList = useMemo(() => {
    return foodListingByDay.filter(
      (f: TListing) =>
        Listing(f).getMetadata().adminApproval === EFoodApprovalState.ACCEPTED,
    );
  }, [JSON.stringify(pickedFood)]);

  const isOverMaxItemsToShow = acceptedFoodList.length > MAX_ITEM_TO_SHOW;
  const foodListToRender =
    isOverMaxItemsToShow && showMoreControl.value
      ? foodList.slice(0, 3)
      : foodList;
  const daysOfWeekEnableToApply = useMemo(
    () => daysOfWeek.filter((d: string) => d !== currentDay),
    [JSON.stringify(daysOfWeek), currentDay],
  );
  const shouldShowApplyToAnotherDayBtn =
    !isEmptyFoodList && !(daysOfWeekEnableToApply?.length === 0);

  const submitting =
    createDraftMenuInProgress ||
    updateDraftMenuInProgress ||
    publishDraftMenuInProgress;

  const disableSubmitApplyToAnotherDay = daysToApply?.length === 0;

  const currentFoodIds = foodList.map((f: TObject) => f.id);

  const handleSelectDaysToApply = (value: string[]) => {
    setDaysToApply(value);
  };

  const handleSelectAllDay = () => {
    if (selectAllDaysControl.value) {
      setDaysToApply([]);
    } else {
      setDaysToApply(daysOfWeekEnableToApply);
    }
  };

  const selectAllDaysClasses = classNames(css.dayLabel, {
    [css.dayLabelActive]: selectAllDaysControl.value,
  });

  const handleApplyForAnotherDay = () => {
    if (submitting) {
      return;
    }
    let newFoodByDate = foodByDate;

    if (isDraftEditFlow) {
      if (foodByDate[meal] && foodByDate[meal][currentDay]) {
        const currentDayData = foodByDate[meal][currentDay];

        newFoodByDate = {
          ...foodByDate,
          [meal]: {
            ...foodByDate[meal],
            ...daysToApply.reduce((prev, day) => {
              return { ...prev, [day]: currentDayData };
            }, {}),
          },
        };
      }
    } else if (foodByDate[currentDay]) {
      const currentDayData = foodByDate[currentDay];

      newFoodByDate = {
        ...foodByDate,
        ...daysToApply.reduce((prev, day) => {
          return { ...prev, [day]: currentDayData };
        }, {}),
      };
    }

    saveDraftFoodByDate(newFoodByDate);
    confirmApplyForAnotherDayControl.setFalse();
    applyFoodForAnotherDayControl.setTrue();
  };

  const handleClickDeleteMeal = () => {
    confirmDeleteMealControl.setTrue();
  };

  const handleDeleteMeal = () => {
    if (submitting) {
      return;
    }
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

  const handleRemoveFoodFromMeal = (id: string) => () => {
    if (submitting) {
      return;
    }
    let newFoodByDate = foodByDate;

    if (isDraftEditFlow) {
      if (foodByDate[meal] && foodByDate[meal][currentDay]) {
        newFoodByDate = {
          ...foodByDate,
          [meal]: {
            ...foodByDate[meal],
            [currentDay]: omit(foodByDate[meal][currentDay], id),
          },
        };
      }
    } else if (foodByDate[currentDay]) {
      newFoodByDate = {
        ...foodByDate,
        [currentDay]: omit(foodByDate[currentDay], id),
      };
    }

    saveDraftFoodByDate(newFoodByDate);
  };

  useEffect(() => {
    const hasNoDiffs = isEmpty(
      difference(daysOfWeekEnableToApply, daysToApply),
    );
    const isSelectDaysEmpty = isEmpty(daysToApply);
    if (isSelectDaysEmpty) {
      selectAllDaysControl.setFalse();
    } else if (hasNoDiffs && !selectAllDaysControl.value) {
      selectAllDaysControl.setTrue();
    } else if (!hasNoDiffs && selectAllDaysControl.value) {
      selectAllDaysControl.setFalse();
    }
  }, [
    JSON.stringify(daysToApply),
    JSON.stringify(daysOfWeekEnableToApply),
    selectAllDaysControl.value,
  ]);

  return (
    <div className={css.mealContainer} key={meal}>
      <div className={css.mealHeadContainer}>
        <div>
          <IconCloseWithCircle onClick={handleClickDeleteMeal} />
          <span>
            {mealLabel} {isEmptyFoodList ? '' : `(${acceptedFoodList.length})`}
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

            if (typeof foodListingMaybe === 'undefined') {
              return null;
            }
            const { title } = Listing(foodListingMaybe).getAttributes();
            const { adminApproval } = Listing(foodListingMaybe).getMetadata();

            if (adminApproval !== EFoodApprovalState.ACCEPTED) {
              return null;
            }

            return (
              <div key={id} className={css.pickedFoodItem}>
                <div className={css.foodTitle}>
                  <div>{title}</div>

                  <div
                    className={css.deleteFoodBtn}
                    onClick={handleRemoveFoodFromMeal(id)}>
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

          <RenderWhen condition={shouldShowApplyToAnotherDayBtn}>
            <div
              className={css.applyFoodBtn}
              onClick={confirmApplyForAnotherDayControl.setTrue}>
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

      <Alert
        className={css.addFoodSuccess}
        openClassName={css.addFoodSuccessOpen}
        message={'Áp dụng món thành công'}
        isOpen={applyFoodForAnotherDayControl.value}
        onClose={applyFoodForAnotherDayControl.setFalse}
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

      <AlertModal
        id={`confirmApplyForAnotherDayModal.${currentDay}.${meal}`}
        isOpen={confirmApplyForAnotherDayControl.value}
        title={'Chọn thứ áp dụng món'}
        shouldFullScreenInMobile={false}
        containerClassName={css.confirmDeleteMenuModal}
        handleClose={confirmApplyForAnotherDayControl.setFalse}
        cancelLabel={'Huỷ'}
        confirmLabel={'Áp dụng'}
        confirmDisabled={disableSubmitApplyToAnotherDay}
        onCancel={confirmApplyForAnotherDayControl.setFalse}
        onConfirm={handleApplyForAnotherDay}
        actionsClassName={css.confirmDeleteModalAction}>
        <div onClick={handleSelectAllDay} className={selectAllDaysClasses}>
          Cả tuần
        </div>

        {meal && confirmApplyForAnotherDayControl.value && (
          <ApplyForAnotherDayForm
            onSubmit={() => {}}
            initialValues={{
              daysToApply,
            }}
            setDaysToApply={handleSelectDaysToApply}
            daysOfWeek={daysOfWeekEnableToApply}
          />
        )}
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
    daysOfWeek = [],
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
              daysOfWeek={daysOfWeek}
              key={`${currentDay}.${meal}.${index}`}
              meal={meal}
              isFirst={index === 0}
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
