/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo } from 'react';
import { shallowEqual } from 'react-redux';

import FieldDropdownSelect from '@components/FormFields/FieldDropdownSelect/FieldDropdownSelect';
import FieldLabelCheckbox from '@components/FormFields/FieldLabelCheckbox/FieldLabelCheckbox';
import FieldRating from '@components/FormFields/FieldRating/FieldRating';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';

import { OrderRatingThunks } from '../../rating/OrderRating.slice';

import css from './OrderRatingForm.module.scss';

type TFoodRatingProps = {
  values: any;
  restaurantsByDay: any;
  isShowTitle?: boolean;
};

const OPTIONAL_FOOD_RESTAURANT_SATISFACTED =
  'optionalFood-restaurant-satifacted';
const OPTIONAL_FOOD_RESTAURANT_UNSATISFACTED =
  'optionalFood-restaurant-unsatifacted';

const FoodRating: React.FC<TFoodRatingProps> = (props) => {
  const dispatch = useAppDispatch();
  const { values, restaurantsByDay, isShowTitle } = props;

  const fetchFoodListByRestaurant = useAppSelector(
    (state) => state.OrderRating.fetchFoodListByRestaurantInProgress,
  );
  const foodListByRestaurant = useAppSelector(
    (state) => state.OrderRating.foodListByRestaurant,
    shallowEqual,
  );

  const isFoodSelected = !!values?.food;
  const isFoodSatifactedSelected = values?.food && values?.food >= 3;
  const isFoodListReadyToFetch =
    isFoodSelected &&
    (values[OPTIONAL_FOOD_RESTAURANT_SATISFACTED] ||
      values[OPTIONAL_FOOD_RESTAURANT_UNSATISFACTED]);

  const optionalFoodRatingOptions = useMemo(() => {
    if (
      (isFoodSatifactedSelected &&
        values[OPTIONAL_FOOD_RESTAURANT_SATISFACTED]) ||
      (!isFoodSatifactedSelected &&
        values[OPTIONAL_FOOD_RESTAURANT_UNSATISFACTED])
    ) {
      const [restaurantId, timestamp] = isFoodSatifactedSelected
        ? values[OPTIONAL_FOOD_RESTAURANT_SATISFACTED].split(' - ')
        : values[OPTIONAL_FOOD_RESTAURANT_UNSATISFACTED].split(' - ');

      return foodListByRestaurant[`${restaurantId} - ${timestamp}`]?.map(
        (item) => ({
          label: item.foodName,
          key: `${restaurantId} - ${timestamp} - ${item.foodId}`,
        }),
      );
    }
  }, [
    foodListByRestaurant,
    isFoodSatifactedSelected,
    isFoodSelected,
    values[OPTIONAL_FOOD_RESTAURANT_SATISFACTED],
    values[OPTIONAL_FOOD_RESTAURANT_UNSATISFACTED],
  ]);
  useEffect(() => {
    if (isFoodSelected) {
      if (
        (isFoodSatifactedSelected &&
          values[OPTIONAL_FOOD_RESTAURANT_SATISFACTED]) ||
        (!isFoodSatifactedSelected &&
          values[OPTIONAL_FOOD_RESTAURANT_UNSATISFACTED])
      ) {
        const [restaurantId, timestamp] = isFoodSatifactedSelected
          ? values[OPTIONAL_FOOD_RESTAURANT_SATISFACTED].split(' - ')
          : values[OPTIONAL_FOOD_RESTAURANT_UNSATISFACTED].split(' - ');
        dispatch(
          OrderRatingThunks.fetchFoodListByRestaurant({
            restaurantId,
            timestamp,
          }),
        );
      }
    }
  }, [
    dispatch,
    isFoodSatifactedSelected,
    isFoodSelected,
    values[OPTIONAL_FOOD_RESTAURANT_SATISFACTED],
    values[OPTIONAL_FOOD_RESTAURANT_UNSATISFACTED],
  ]);

  const parsedRestaurantByDayOptions = useMemo(
    () =>
      restaurantsByDay.map(
        ({ restaurantId, restaurantName, timestamp }: any) => ({
          key: `${restaurantId} - ${timestamp}`,
          label: restaurantName,
        }),
      ),
    [JSON.stringify(restaurantsByDay)],
  );

  const optionalFoodRating = isFoodSatifactedSelected ? (
    <>
      <div className={css.optionalFieldTitle}>Món nào khiến bạn ấn tượng?</div>
      <FieldDropdownSelect
        name={OPTIONAL_FOOD_RESTAURANT_SATISFACTED}
        id="optionalFood-restaurant"
        className={css.optionalSelectField}
        placeholder="Chọn nhà hàng bạn muốn đánh giá"
        options={parsedRestaurantByDayOptions}
      />

      {fetchFoodListByRestaurant ? (
        <div>Đang tải dữ liệu...</div>
      ) : (
        isFoodListReadyToFetch && (
          <FieldLabelCheckbox
            name="optionalFood-satifacted"
            options={optionalFoodRatingOptions || []}
            containerClassName={css.optionalFieldContainer}
          />
        )
      )}
    </>
  ) : (
    <>
      <div className={css.optionalFieldTitle}>
        Món nào khiến không bạn ấn tượng?
      </div>
      <FieldDropdownSelect
        name={OPTIONAL_FOOD_RESTAURANT_UNSATISFACTED}
        id="optionalFood-restaurant"
        className={css.optionalSelectField}
        options={parsedRestaurantByDayOptions}
        placeholder="Chọn nhà hàng bạn muốn đánh giá"
      />

      {fetchFoodListByRestaurant ? (
        <div>Đang tải dữ liệu...</div>
      ) : (
        isFoodListReadyToFetch && (
          <FieldLabelCheckbox
            name="optionalFood-unsatifacted"
            options={optionalFoodRatingOptions || []}
            containerClassName={css.optionalFieldContainer}
          />
        )
      )}
    </>
  );

  return (
    <>
      <div className={css.detailRatingMainField}>
        <div className={css.detailRatingTitle}>Món ăn</div>
        <FieldRating
          name="food"
          containerClassName={css.fieldContainer}
          iconClassName={css.faceIcon}
          titleShowed={isShowTitle}
        />
      </div>
      {isFoodSelected && (
        <div className={css.detailRatingOptionalField}>
          {optionalFoodRating}
        </div>
      )}
    </>
  );
};

export default FoodRating;
