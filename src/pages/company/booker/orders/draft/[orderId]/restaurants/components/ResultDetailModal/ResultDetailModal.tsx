import IconClose from '@components/Icons/IconClose/IconClose';
import Modal from '@components/Modal/Modal';
import Image from 'next/image';
import React from 'react';

import coverImage from './cover.png';
import FoodListSection from './FoodListSection';
import ResultDetailFilters from './ResultDetailFilters';
import ResultDetailHeader from './ResultDetailHeader';
import css from './ResultDetailModal.module.scss';
import TopContent from './TopContent';

type TResultDetailModalProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

const ResultDetailModal: React.FC<TResultDetailModalProps> = ({
  isOpen = false,
  onClose = () => null,
}) => {
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
      <ResultDetailHeader />
      <div className={css.contentScroll}>
        <div className={css.content}>
          <div className={css.coverImage}>
            <Image src={coverImage} alt="cover" />
          </div>
          <TopContent />
          <ResultDetailFilters />
          <FoodListSection />
        </div>
      </div>
    </Modal>
  );
};

export default ResultDetailModal;
