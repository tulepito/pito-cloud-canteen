import Button from '@components/Button/Button';
import IconClose from '@components/Icons/IconClose/IconClose';
import Modal from '@components/Modal/Modal';
import useBoolean from '@hooks/useBoolean';
import Image from 'next/image';
import React, { useState } from 'react';
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
};

const ResultDetailModal: React.FC<TResultDetailModalProps> = ({
  isOpen = false,
  onClose = () => null,
}) => {
  const intl = useIntl();
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const foodModal = useBoolean(false);

  const handleSelecFood = (foodId: string) => {
    setSelectedFoods([...selectedFoods, foodId]);
  };

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
            <ResultDetailFilters />
            <FoodListSection
              onSelectFood={handleSelecFood}
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
