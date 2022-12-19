import Button from '@components/Button/Button';
import IconModalClose from '@components/IconModalClose/IconModalClose';
import OutsideClickHandler from '@components/OutsideClickHandler/OutsideClickHandler';
import classNames from 'classnames';

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
    id,
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
  const modalClasses = classNames(css.modal, {
    [css.open]: isOpen,
  });
  if (!isOpen) {
    return null;
  }
  return (
    <div id={id} className={modalClasses}>
      <div className={css.overlay}>
        <OutsideClickHandler onOutsideClick={onClose}>
          <div className={css.modalContainer}>
            <div className={css.modalHeader}>
              <span className={css.modalTitle}>{title}</span>
              <IconModalClose onClick={onClose} />
            </div>
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
      </div>
    </div>
  );
};

export default ConfirmationModal;
