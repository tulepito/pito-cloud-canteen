import Button from '@components/Button/Button';
import Modal from '@components/Modal/Modal';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';

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
  } = props;

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      handleClose={onClose}
      title={title}
      containerClassName={css.modalContainer}>
      <OutsideClickHandler onOutsideClick={onClose}>
        <div className={css.modalContainer}>
          <div className={css.modalContent}>
            <p>{description}</p>
            {hasError && <p className={css.error}>{hasError}</p>}
          </div>
          <div className={css.modalFooter}>
            {cancelText && (
              <Button className={css.cancelBtn} onClick={onCancel}>
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
    </Modal>
  );
};

export default ConfirmationModal;
