import Button from '@components/Button/Button';
import type { PropsWithChildren, ReactNode } from 'react';

import css from './AlertModal.module.scss';
import Modal from './Modal';

type TAlertModal = {
  isOpen: boolean;
  title?: string;
  className?: string;
  cancelLabel?: ReactNode;
  confirmLabel?: ReactNode;
  handleClose: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  confirmDisabled?: boolean;
  confirmInProgress?: boolean;
};

const AlertModal: React.FC<PropsWithChildren<TAlertModal>> = ({
  isOpen,
  title,
  children,
  cancelLabel,
  confirmLabel,
  handleClose,
  onCancel,
  onConfirm,
  confirmInProgress,
  confirmDisabled,
}) => {
  return (
    <Modal
      title={title}
      isOpen={isOpen}
      handleClose={handleClose}
      containerClassName={css.container}>
      <div className={css.children}>{children}</div>
      <div className={css.actions}>
        <Button className={css.reject} size="medium" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button
          disabled={confirmDisabled}
          inProgress={confirmInProgress}
          className={css.confirm}
          size="medium"
          onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};

export default AlertModal;
