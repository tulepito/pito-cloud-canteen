import { useEffect } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import { shallowEqual } from 'react-redux';
import compact from 'lodash/compact';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import { FieldTextInputComponent } from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconFilter from '@components/Icons/IconFilter/IconFilter';
import IconSearch from '@components/Icons/IconSearch/IconSearch';
import SlideModal from '@components/SlideModal/SlideModal';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { foodSliceThunks } from '@redux/slices/foods.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import { partnerPaths } from '@src/paths';
import { CurrentUser, Listing } from '@src/utils/data';
import type { TListing } from '@src/utils/types';

import type { TSelectFoodForMealFormValues } from './SelectFoodForMealForm';
import SelectFoodForMealForm from './SelectFoodForMealForm';

import css from './SelectFoodForMealModal.module.scss';

type TSelectFoodForMealModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SelectFoodForMealModal: React.FC<TSelectFoodForMealModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(currentUserSelector);
  const foods = useAppSelector((state) => state.foods.foods, shallowEqual);

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
        id="SelectFoodForMealModal"
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
          <Button variant="secondary" className={css.filterBtn}>
            <IconFilter />
            <div>Lọc</div>
          </Button>
        </div>
        <SelectFoodForMealForm onSubmit={handleSubmit} />
      </SlideModal>
    </div>
  );
};

export default SelectFoodForMealModal;
