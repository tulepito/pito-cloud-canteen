import Button from '@components/Button/Button';
import IconClose from '@components/Icons/IconClose/IconClose';
import Modal from '@components/Modal/Modal';
import useBoolean from '@hooks/useBoolean';
import type { TListing } from '@utils/types';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import FoodDetailModal from '../FoodDetailModal/FoodDetailModal';
import coverImage from './cover.png';
import FoodListSection from './FoodListSection';
import ResultDetailFilters from './ResultDetailFilters';
import ResultDetailHeader from './ResultDetailHeader';
import css from './ResultDetailModal.module.scss';
import TopContent from './TopContent';

type TResultDetailModalProps = {
  isOpen?: boolean;
  onClose?: () => void;
  onClickFood?: () => void;
  selectedRestaurantId?: string;
  restaurantFood: {
    [restaurantId: string]: TListing[];
  };
};

const ResultDetailModal: React.FC<TResultDetailModalProps> = ({
  isOpen = false,
  onClose = () => null,
  restaurantFood,
  selectedRestaurantId,
}) => {
  const intl = useIntl();
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const selectAllControl = useBoolean(false);
  const foodModal = useBoolean(false);
  // console.log('selectedFoods: ', selectedFoods);
  console.log('selectAllControl', selectAllControl.value);

  const handleSelecFood = (foodId: string) => {
    setSelectedFoods([...selectedFoods, foodId]);
  };

  const handleRemoveFood = (foodId: string) => {
    setSelectedFoods(selectedFoods.filter((id) => id !== foodId));
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedFoods([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectAllControl.value) {
      const foodList = restaurantFood?.[selectedRestaurantId!];
      const foodIds = foodList?.map((food) => food.id?.uuid);
      setSelectedFoods(foodIds || []);
    }
  }, [restaurantFood, selectAllControl.value, selectedRestaurantId]);

  useEffect(() => {
    if (
      selectedFoods.length < restaurantFood?.[selectedRestaurantId!]?.length &&
      selectAllControl.value
    ) {
      selectAllControl.setFalse();
    }
  }, [
    restaurantFood,
    selectAllControl,
    selectedFoods.length,
    selectedRestaurantId,
  ]);

  const foodList = restaurantFood?.[selectedRestaurantId!];
  return (
    <>
      <Modal
        scrollLayerClassName={css.scrollLayer}
        containerClassName={css.modalContainer}
        isOpen={isOpen}
        handleClose={onClose}
        customHeader={
          <div className={css.modalHeader}>
            <IconClose className={css.iconClose} onClick={onClose} />
          </div>
        }>
        <ResultDetailHeader />
        <div className={css.contentScroll}>
          <div className={css.content}>
            <div className={css.coverImage}>
              <Image src={coverImage} alt="cover" />
            </div>
            <TopContent />
            <ResultDetailFilters
              initialValues={{ isSelectAll: selectAllControl.value }}
              onSelectAll={selectAllControl.setValue}
            />
            <FoodListSection
              foodList={foodList}
              onSelectFood={handleSelecFood}
              onRemoveFood={handleRemoveFood}
              onClickFood={foodModal.setTrue}
              selectedFoodIds={selectedFoods}
            />
          </div>
        </div>
        <div className={css.footer}>
          <Button className={css.submitBtn}>
            {intl.formatMessage(
              {
                id: 'booker.orders.draft.resultDetailModal.addRestaurant',
              },
              {
                numberDish: selectedFoods.length,
              },
            )}
          </Button>
        </div>
      </Modal>
      <FoodDetailModal isOpen={foodModal.value} onClose={foodModal.setFalse} />
    </>
  );
};

export default ResultDetailModal;
