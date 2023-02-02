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
  containerClassName?: string;
  actionsClassName?: string;
  cancelClassName?: string;
  confirmClassName?: string;
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
  containerClassName,
  actionsClassName,
  cancelClassName,
  confirmClassName,
}) => {
  return (
    <Modal
      title={title}
      isOpen={isOpen}
      handleClose={handleClose}
      containerClassName={classNames(css.container, containerClassName)}>
      <div className={css.children}>{children}</div>
      <div className={classNames(css.actions, actionsClassName)}>
        {cancelLabel && (
          <Button
            className={classNames(css.reject, cancelClassName)}
            size="medium"
            onClick={onCancel}>
            {cancelLabel}
          </Button>
        )}
        {confirmLabel && (
          <Button
            disabled={confirmDisabled}
            inProgress={confirmInProgress}
            className={classNames(css.confirm, confirmClassName)}
            size="medium"
            onClick={onConfirm}>
            {confirmLabel}
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default AlertModal;
