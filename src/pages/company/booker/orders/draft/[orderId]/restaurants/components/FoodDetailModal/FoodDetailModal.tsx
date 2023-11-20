import React from 'react';
import { useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconClose from '@components/Icons/IconClose/IconClose';
import Modal from '@components/Modal/Modal';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import { addCommas } from '@helpers/format';
import { FOOD_SIDE_DISH_OPTIONS } from '@src/utils/options';
import { Listing } from '@utils/data';
import { EImageVariants } from '@utils/enums';
import type { TListing } from '@utils/types';

import css from './FoodDetailModal.module.scss';

type TFoodDetailModalProps = {
  isOpen?: boolean;
  food?: TListing;
  onClose?: () => void;
  onSelect?: (foodId: string) => void;
};

const FoodDetailModal: React.FC<TFoodDetailModalProps> = ({
  isOpen = false,
  food,
  onClose = () => null,
  onSelect = () => null,
}) => {
  const intl = useIntl();

  const { sideDishes = [] } = Listing(food!).getPublicData();
  const renderedSideDishes = sideDishes?.map(
    (sideDish: string, index: number) => (
      <div className={css.sideDish} key={`${index}-${sideDish}`}>
        {
          FOOD_SIDE_DISH_OPTIONS.find((option) => option.key === sideDish)
            ?.label
        }
      </div>
    ),
  );
  const handleSelectFood = () => {
    onSelect(food?.id?.uuid);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      id="FoodDetailModal"
      scrollLayerClassName={css.scrollLayer}
      containerClassName={css.modalContainer}
      isOpen={isOpen}
      handleClose={onClose}
      customHeader={
        <div className={css.modalHeader}>
          <IconClose className={css.iconClose} onClick={onClose} />
        </div>
      }>
      <div className={css.header}>
        <span className={css.goBack} onClick={onClose}>
          <IconArrow className={css.iconBack} direction="left" />
          <span>
            {intl.formatMessage({
              id: 'booker.orders.draft.foodDetailModal.back',
            })}
          </span>
        </span>
      </div>
      <div className={css.scrollContainer}>
        <div className={css.coverImage}>
          <ResponsiveImage
            alt={Listing(food!).getAttributes().title}
            image={Listing(food!).getImages()[0]}
            variants={[EImageVariants.default]}
          />
        </div>
        <div className={css.topContent}>
          <div className={css.foodTitle}>
            {Listing(food!).getAttributes().title}
          </div>
          <div className={css.price}>{`${addCommas(
            Listing(food!).getAttributes().price?.amount,
          )} ₫ / Phần`}</div>
        </div>
        <p className={css.description}>
          {Listing(food!).getAttributes().description || 'Không có mô tả'}
        </p>
      </div>
      <div className={css.sideDishesWrapper}>
        <div className={css.sideDishesTitle}>
          {intl.formatMessage({
            id: 'booker.orders.draft.foodDetailModal.sideDishesTitle',
          })}
        </div>
        {renderedSideDishes}
      </div>
      <div className={css.footer}>
        <Button className={css.submitBtn} onClick={handleSelectFood}>
          {intl.formatMessage({
            id: 'booker.orders.draft.foodDetailModal.addDish',
          })}
        </Button>
      </div>
    </Modal>
  );
};

export default FoodDetailModal;
