import type { PropsWithChildren } from 'react';

import IconClose from '@components/Icons/IconClose/IconClose';
import PopupModal from '@components/PopupModal/PopupModal';

import css from './SlideModal.module.scss';

type TSlideModalProps = PropsWithChildren & {
  id: string;
  isOpen: boolean;
  modalTitle?: string;
  onClose: () => void;
};

const SlideModal: React.FC<TSlideModalProps> = (props) => {
  const { isOpen, onClose, id, children, modalTitle } = props;

  return (
    <PopupModal
      id={id}
      isOpen={isOpen}
      handleClose={onClose}
      closeClassName={css.slideModalClose}
      openClassName={css.slideModalOpen}
      scrollLayerClassName={css.slideModalScrollLayer}
      customHeader={
        <div className={css.modalHeader}>
          <IconClose className={css.closeIcon} onClick={onClose} />
          {modalTitle && <div className={css.title}>{modalTitle}</div>}
        </div>
      }
      containerClassName={css.slideModalContainer}>
      {children}
    </PopupModal>
  );
};

export default SlideModal;
