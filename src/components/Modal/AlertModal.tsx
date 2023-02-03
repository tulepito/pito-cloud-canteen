import Button from '@components/Button/Button';
import classNames from 'classnames';
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
  cancelDisabled?: boolean;
  containerClassName?: string;
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
  confirmInProgress = false,
  confirmDisabled = false,
  cancelDisabled = false,
  containerClassName,
}) => {
  return (
    <Modal
      className={css.modalRoot}
      title={title}
      isOpen={isOpen}
      handleClose={handleClose}
      containerClassName={classNames(css.container, containerClassName)}>
      <div className={css.children}>{children}</div>
      <div className={css.actions}>
        <Button
          disabled={cancelDisabled}
          className={css.reject}
          variant="secondary"
          size="medium"
          onClick={onCancel}>
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
