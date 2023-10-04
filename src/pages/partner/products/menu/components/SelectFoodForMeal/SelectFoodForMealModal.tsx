import { useEffect, useState } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import { shallowEqual } from 'react-redux';
import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import { FieldTextInputComponent } from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconFilter from '@components/Icons/IconFilter/IconFilter';
import IconSearch from '@components/Icons/IconSearch/IconSearch';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import SlideModal from '@components/SlideModal/SlideModal';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { foodSliceThunks } from '@redux/slices/foods.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import { partnerPaths } from '@src/paths';
import { CurrentUser, Listing } from '@src/utils/data';
import type { TListing, TObject } from '@src/utils/types';

import FilterForm from './FilterFoodForm';
import type { TSelectFoodForMealFormValues } from './SelectFoodForMealForm';
import SelectFoodForMealForm from './SelectFoodForMealForm';

import css from './SelectFoodForMealModal.module.scss';

type TSelectFoodForMealModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  meal: string;
};

const SelectFoodForMealModal: React.FC<TSelectFoodForMealModalProps> = ({
  isOpen,
  onClose,
  meal,
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(currentUserSelector);
  const foods = useAppSelector((state) => state.foods.foods, shallowEqual);
  const filterModalControl = useBoolean();
  const shouldClearFilterFormControl = useBoolean();
  const filterFormValidControl = useBoolean();
  const [filterValues, setFilterValues] = useState({});

  const isEmptyFoodList = foods?.length === 0;

  const { restaurantListingId: restaurantId } =
    CurrentUser(currentUser).getMetadata();

  const { form } = useForm({
    initialValues: {},
    onSubmit: () => {},
  });
  const keywordsField = useField('keywords', form);

  const handleSubmit = (values: TSelectFoodForMealFormValues) => {
    if (isEmptyFoodList) {
      // TODO: navigate to create food page
      router.push(partnerPaths.CreateFood);
    } else {
      const { food = [] } = values;

      const foodToUpdate = compact(
        food.map((id) => {
          const foodListingMaybe = foods.find(
            (f: TListing) => f.id.uuid === id,
          );

          if (foodListingMaybe) {
            const foodGetter = Listing(foodListingMaybe);
            const { sideDishes = [] } = foodGetter.getPublicData();

            return {
              foodNote: '',
              id,
              price: foodListingMaybe.attributes.price,
              sideDishes,
            };
          }

          return null;
        }),
      );

      return foodToUpdate;
    }
  };

  const handleOpenFilterFoodModal = () => {
    filterModalControl.setTrue();
    // onClose();
  };

  const handleSubmitFilter = () => {
    if (restaurantId && isOpen) {
      const { startPrice, endPrice, foodType, createAtStart, createAtEnd } =
        (filterValues || {}) as TObject;

      const priceFilterMaybe =
        startPrice || endPrice
          ? {
              price: `${(startPrice || '').split('.').join('')},${(
                endPrice || ''
              )
                .split('.')
                .join('')}`,
            }
          : {};

      dispatch(
        foodSliceThunks.queryPartnerFoods({
          restaurantId,
          page: 1,
          keywords: keywordsField.input.value,
          ...priceFilterMaybe,
          ...(foodType ? { pub_foodType: foodType } : {}),
          ...(createAtStart
            ? { createAtStart: new Date(+createAtStart).toISOString() }
            : {}),
          ...(createAtEnd
            ? {
                createAtEnd: new Date(
                  +(createAtStart && createAtEnd === createAtStart
                    ? createAtEnd + 1
                    : createAtEnd),
                ).toISOString(),
              }
            : {}),
        }),
      );
    }

    filterModalControl.setFalse();
  };

  const handleClearFilter = () => {
    shouldClearFilterFormControl.setTrue();
    setFilterValues({});

    if (restaurantId && isOpen && !isEmpty(filterValues)) {
      dispatch(
        foodSliceThunks.queryPartnerFoods({
          restaurantId,
          page: 1,
          keywords: keywordsField.input.value,
        }),
      );
    }
  };

  useEffect(() => {
    if (restaurantId && isOpen) {
      dispatch(
        foodSliceThunks.queryPartnerFoods({
          restaurantId,
          page: 1,
          keywords: keywordsField.input.value,
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, restaurantId, keywordsField.input.value]);

  return (
    <div className={css.root}>
      <SlideModal
        id={`SelectFoodForMealModal.${meal}`}
        modalTitle="Chọn món ăn"
        isOpen={isOpen}
        onClose={onClose}>
        <div className={css.searchFilterContainer}>
          <FieldTextInputComponent
            id="SelectFoodForMealModal.keywords"
            leftIcon={<IconSearch />}
            input={keywordsField.input}
            meta={keywordsField.meta}
          />
          <Button
            variant="secondary"
            className={css.filterBtn}
            onClick={handleOpenFilterFoodModal}>
            <IconFilter />
            <div>Lọc</div>
          </Button>
        </div>
        {meal && (
          <SelectFoodForMealForm
            formId={`SelectFoodForMealForm.${meal}`}
            onSubmit={handleSubmit}
          />
        )}

        <RenderWhen condition={isEmptyFoodList}>
          <Button className={css.submitButton}>Thêm món ăn</Button>
          <RenderWhen.False>
            <Button className={css.submitButton}>Chọn món</Button>
          </RenderWhen.False>
        </RenderWhen>
      </SlideModal>

      <SlideModal
        id={`SelectFoodForMealModal.FilterFoodModal.${meal}`}
        modalTitle="Lọc"
        isOpen={filterModalControl.value}
        onClose={filterModalControl.setFalse}>
        <FilterForm
          setValidState={filterFormValidControl.setValue}
          shouldClearForm={shouldClearFilterFormControl.value}
          setShouldClearForm={shouldClearFilterFormControl.setValue}
          onSubmit={handleSubmitFilter}
          setFilterValues={setFilterValues}
          initialValues={filterValues}
        />
        <div className={css.btns}>
          <Button
            type="button"
            className={css.filterFormBtn}
            size="medium"
            variant="secondary"
            onClick={handleClearFilter}>
            Xoá bộ lọc
          </Button>

          <Button
            type="submit"
            className={css.filterFormBtn}
            disabled={!filterFormValidControl.value}
            size="medium"
            onClick={handleSubmitFilter}>
            Lọc
          </Button>
        </div>
      </SlideModal>
    </div>
  );
};

export default SelectFoodForMealModal;
