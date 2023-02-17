import Button from '@components/Button/Button';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconClose from '@components/Icons/IconClose/IconClose';
import Modal from '@components/Modal/Modal';
import Image from 'next/image';
import React from 'react';
import { useIntl } from 'react-intl';

import coverImage from './foodCover.png';
import css from './FoodDetailModal.module.scss';
import OptionSelectionForm from './OptionSelectionForm';

type TFoodDetailModalProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

const FoodDetailModal: React.FC<TFoodDetailModalProps> = ({
  isOpen = false,
  onClose = () => null,
}) => {
  const intl = useIntl();

  return (
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
          <Image src={coverImage} alt="cover" />
        </div>
        <div className={css.topContent}>
          <div className={css.foodTitle}>Hàu sữa nướng phô mai</div>
          <div className={css.price}>30,000 ₫ / Phần</div>
        </div>
        <p className={css.description}>
          Lorem ipsum dolor sit amet consectetur. Sed penatibus ullamcorper ut
          feugiat non tempor. In ornare diam sapien turpis gravida pulvinar enim
          elementum. Gravida nunc adipiscing rutrum est ut morbi tellus nulla.
          Pretium quisque facilisi arcu a et eu. Turpis aliquet cursus ipsum
          eget nibh fermentum amet. Massa nisl tortor quis in urna odio sagittis
          nec. Quis tellus in mi tortor tempor lectus id ultrices. Dui tellus
          velit vel tellus laoreet. At eget massa id semper dolor.
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
