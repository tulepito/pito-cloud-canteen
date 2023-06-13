import { useEffect, useRef, useState } from 'react';

import Button from '@components/Button/Button';
import Modal from '@components/Modal/Modal';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import PopupModal from '@components/PopupModal/PopupModal';
import RenderWhen from '@components/RenderWhen/RenderWhen';

import css from './ConfirmationModal.module.scss';

type ConfirmationModalProps = {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  isConfirmButtonLoading?: boolean;
  hasError?: string;
  isPopup?: boolean;
  secondForAutoClose?: number;
};
const ConfirmationModal: React.FC<ConfirmationModalProps> = (props) => {
  const {
    isOpen,
    onClose,
    title,
    description,
    onConfirm,
    onCancel,
    confirmText,
    cancelText,
    isConfirmButtonLoading,
    hasError,
    isPopup = false,
    secondForAutoClose,
  } = props;
  const [secondToClose, setSecondToClose] = useState<number>(
    secondForAutoClose!,
  );
  const intevalRef = useRef<any>(null);

  useEffect(() => {
    if (secondForAutoClose && isOpen) {
      intevalRef.current = setInterval(() => {
        setSecondToClose((prev) => prev - 1);
      }, 1000);
    }
    if (secondToClose === 0 && isOpen) {
      onClose();
    }

    return () => {
      clearInterval(intevalRef.current);
    };
  }, [onClose, secondForAutoClose, secondToClose, isOpen]);

  useEffect(() => {
    if (secondForAutoClose && !isOpen) {
      setSecondToClose(secondForAutoClose);
    }
  }, [isOpen, secondForAutoClose]);

  if (!isOpen) return null;

  const ModalComponent = isPopup ? PopupModal : Modal;

  return (
    <ModalComponent
      isOpen={isOpen}
      handleClose={onClose}
      title={title}
      containerClassName={css.modalContainer}>
      <OutsideClickHandler onOutsideClick={onClose}>
        <div className={css.modalContainer}>
          <div className={css.modalContent}>
            <p>{description}</p>
            <RenderWhen condition={!!secondForAutoClose}>
              <p className={css.timeToClose}>
                Đóng lại trong {secondToClose} giây
              </p>
            </RenderWhen>
            {hasError && <p className={css.error}>{hasError}</p>}
          </div>
          <div className={css.modalFooter}>
            {cancelText && (
              <Button
                variant="secondary"
                className={css.cancelBtn}
                onClick={onCancel}>
                {cancelText}
              </Button>
            )}
            {confirmText && (
              <Button
                inProgress={isConfirmButtonLoading}
                className={css.confirmBtn}
                onClick={onConfirm}>
                {confirmText}
              </Button>
            )}
          </div>
        </div>
      </OutsideClickHandler>
    </ModalComponent>
  );
};

export default ConfirmationModal;
