import type { PropsWithChildren, ReactNode } from 'react';
import classNames from 'classnames';

import IconClose from '@components/Icons/IconClose/IconClose';
import PopupModal from '@components/PopupModal/PopupModal';

import css from './SlideModal.module.scss';

type TSlideModalProps = PropsWithChildren & {
  id: string;
  isOpen: boolean;
  modalTitle?: ReactNode;
  onClose: (e: React.MouseEvent<HTMLElement>) => void;
  containerClassName?: string;
};

const SlideModal: React.FC<TSlideModalProps> = (props) => {
  const { isOpen, onClose, id, children, modalTitle, containerClassName } =
    props;

  const containerClasses = classNames(
    css.slideModalContainer,
    containerClassName,
  );

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
      containerClassName={containerClasses}
      contentClassName={css.slideModalContent}>
      {children}
    </PopupModal>
  );
};

export default SlideModal;
