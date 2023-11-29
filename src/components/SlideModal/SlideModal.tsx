import type { PropsWithChildren, ReactNode } from 'react';
import classNames from 'classnames';

import IconClose from '@components/Icons/IconClose/IconClose';
import PopupModal from '@components/PopupModal/PopupModal';

import css from './SlideModal.module.scss';

type TSlideModalProps = PropsWithChildren & {
  id: string;
  isOpen: boolean;
  contentClassName?: string;
  modalTitle?: ReactNode;
  onClose: ((e: React.MouseEvent<HTMLElement>) => void) | (() => void);
  containerClassName?: string;
  openClassName?: string;
  className?: string;
  shouldShowOverlay?: boolean;
};

const SlideModal: React.FC<TSlideModalProps> = (props) => {
  const {
    isOpen,
    onClose,
    id,
    children,
    modalTitle,
    className,
    contentClassName,
    containerClassName,
    openClassName,
    shouldShowOverlay = false,
  } = props;

  const containerClasses = classNames(
    css.slideModalContainer,
    containerClassName,
  );
  const openClasses = classNames(css.slideModalOpen, openClassName);
  const contentClasses = classNames(css.slideModalContent, contentClassName);

  return (
    <PopupModal
      id={id}
      isOpen={isOpen}
      handleClose={onClose}
      closeClassName={css.slideModalClose}
      openClassName={openClasses}
      scrollLayerClassName={css.slideModalScrollLayer}
      shouldShowOverlay={shouldShowOverlay}
      customHeader={
        <div className={css.modalHeader}>
          <IconClose className={css.closeIcon} onClick={onClose} />
          {modalTitle && <div className={css.title}>{modalTitle}</div>}
        </div>
      }
      containerClassName={containerClasses}
      className={className}
      contentClassName={contentClasses}>
      {children}
    </PopupModal>
  );
};

export default SlideModal;
