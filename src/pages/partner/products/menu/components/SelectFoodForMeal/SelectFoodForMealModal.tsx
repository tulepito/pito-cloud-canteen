/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import { shallowEqual } from 'react-redux';
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
import { useViewport } from '@hooks/useViewport';
import { foodSliceThunks } from '@redux/slices/foods.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import { partnerPaths } from '@src/paths';
import { CurrentUser, Listing } from '@src/utils/data';
import type { TListing, TObject } from '@src/utils/types';

import { PartnerManageMenusActions } from '../../PartnerManageMenus.slice';

import FilterForm from './FilterFoodForm';
import SelectFoodForMealForm from './SelectFoodForMealForm';

import css from './SelectFoodForMealModal.module.scss';

type TSelectFoodForMealModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  meal: string;
  currentDay: string;
  foodByDate: TObject;
  currentFoodIds: string[];
  isDraftEditFlow: boolean;
  saveDraftFoodByDate: (value: TObject) => void;
  turnOnSuccessAddFoodAlert: () => void;
};

const SelectFoodForMealModal: React.FC<TSelectFoodForMealModalProps> = ({
  isOpen,
  onClose,
  meal,
  isDraftEditFlow,
  currentDay,
  foodByDate = {},
  saveDraftFoodByDate,
  currentFoodIds,
  turnOnSuccessAddFoodAlert,
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isMobileLayout } = useViewport();
  const currentUser = useAppSelector(currentUserSelector);
  const foods = useAppSelector((state) => state.foods.foods, shallowEqual);
  const { totalPages = 1 } = useAppSelector((state) => {
    const pagination = state.foods.managePartnerFoodPagination;

    return pagination === null ? {} : pagination;
  }, shallowEqual);
  const [page, setPage] = useState(1);
  const filterModalControl = useBoolean();
  const shouldClearFilterFormControl = useBoolean();
  const filterFormValidControl = useBoolean();
  const [filterValues, setFilterValues] = useState({});
  const [submittedFilterValues, setSubmittedFilterValues] = useState({});
  const [selectedFoodIds, setSelectedFoodIds] = useState<string[]>([]);
  const isEmptyFoodList = foods?.length === 0;

  const { restaurantListingId: restaurantId } =
    CurrentUser(currentUser).getMetadata();

  const { form } = useForm({
    initialValues: {},
    onSubmit: () => {},
  });
  const keywordsField = useField('keywords', form);

  const handleSubmit = () => {
    if (isEmptyFoodList) {
      // TODO: navigate to create food page
      router.push(partnerPaths.CreateFood);
    } else {
      const newPickedFood: TListing[] = [];

      const foodToUpdate = selectedFoodIds.reduce((prev, id) => {
        const foodListingMaybe = foods.find((f: TListing) => f.id.uuid === id);

        if (foodListingMaybe) {
          newPickedFood.push(foodListingMaybe);

          const foodGetter = Listing(foodListingMaybe);
          const { sideDishes = [] } = foodGetter.getPublicData();

          return {
            ...prev,
            [id]: {
              foodNote: '',
              id,
              price: foodListingMaybe.attributes.price.amount || 0,
              sideDishes,
            },
          };
        }

        return prev;
      }, {});

      dispatch(PartnerManageMenusActions.addPickedFood(newPickedFood));

      const newFoodByDate = isDraftEditFlow
        ? {
            ...foodByDate,
            [meal]: {
              ...foodByDate[meal],
              [currentDay]: foodToUpdate,
            },
          }
        : { ...foodByDate, [currentDay]: foodToUpdate };

      saveDraftFoodByDate(newFoodByDate);
      turnOnSuccessAddFoodAlert();
      onClose();
    }
  };

  const handleOpenFilterFoodModal = () => {
    filterModalControl.setTrue();
  };

  const handleSubmitFilter = () => {
    setSubmittedFilterValues(filterValues);
    filterModalControl.setFalse();
  };

  const handleClearFilter = () => {
    shouldClearFilterFormControl.setTrue();
    setFilterValues({});
    setSubmittedFilterValues({});
  };

  const handleFoodKeywordsChange = (event: any) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      return false;
    }
  };

  const setPageCallBack = useCallback(() => {
    setPage((p) =>
      isMobileLayout ? (p + 1 > totalPages ? totalPages : p + 1) : p,
    );
  }, [page, totalPages, isMobileLayout]);
  useEffect(() => {
    if (restaurantId && isOpen) {
      const { startPrice, endPrice, foodType, createAtStart, createAtEnd } =
        (submittedFilterValues || {}) as TObject;

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
          isMobileLayout,
          restaurantId,
          page,
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
  }, [
    isOpen,
    isMobileLayout,
    page,
    restaurantId,
    keywordsField.input.value,
    JSON.stringify(submittedFilterValues),
  ]);
  useEffect(() => {
    setSelectedFoodIds(currentFoodIds);
  }, [JSON.stringify(currentFoodIds)]);

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
            className={css.fieldKeyWords}
            placeholder="Tìm kiếm"
            onKeyPress={handleFoodKeywordsChange}
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
            initialValues={{ food: currentFoodIds }}
            setSelectedFoodIds={setSelectedFoodIds}
            setPageCallBack={setPageCallBack}
          />
        )}

        <RenderWhen condition={isEmptyFoodList}>
          <Button className={css.submitButton} onClick={handleSubmit}>
            Thêm món ăn
          </Button>
          <RenderWhen.False>
            <Button className={css.submitButton} onClick={handleSubmit}>
              Chọn món
            </Button>
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
            onClick={handleClearFilter}
            disabled={isEmpty(filterValues)}>
            Xoá bộ lọc
          </Button>

          <Button
            type="submit"
            className={css.filterFormBtn}
            disabled={isEmpty(filterValues) || !filterFormValidControl.value}
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
