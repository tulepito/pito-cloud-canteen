import Button from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconClose from '@components/Icons/IconClose/IconClose';
import Modal from '@components/Modal/Modal';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import { Listing } from '@utils/data';
import { EImageVariants } from '@utils/enums';
import type { TListing } from '@utils/types';
import React from 'react';
import { useIntl } from 'react-intl';

import css from './FoodDetailModal.module.scss';
import OptionSelectionForm from './OptionSelectionForm';

type TFoodDetailModalProps = {
  isOpen?: boolean;
  onClose?: () => void;
  food?: TListing;
};

const FoodDetailModal: React.FC<TFoodDetailModalProps> = ({
  isOpen = false,
  onClose = () => null,
  food,
}) => {
  const intl = useIntl();
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
          <div className={css.price}>{`${
            Listing(food!).getAttributes()?.price?.amount
          } ₫ / Phần`}</div>
        </div>
        <p className={css.description}>
          {Listing(food!).getAttributes().description || 'Không có mô tả'}
        </p>
        <OptionSelectionForm onSubmit={() => null} />
      </div>
      <div className={css.footer}>
        <Button className={css.submitBtn}>
          {intl.formatMessage({
            id: 'booker.orders.draft.foodDetailModal.addDish',
          })}
        </Button>
      </div>
    </Modal>
  );
};

export default FoodDetailModal;
