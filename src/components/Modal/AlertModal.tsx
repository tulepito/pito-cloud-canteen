import Button from '@components/Button/Button';
import classNames from 'classnames';
import type { PropsWithChildren, ReactNode } from 'react';

import css from './AlertModal.module.scss';
import Modal from './Modal';

type TAlertModal = {
  id?: string;
  isOpen: boolean;
  title?: string | ReactNode;
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
  actionsClassName?: string;
  cancelClassName?: string;
  confirmClassName?: string;
  childrenClassName?: string;
};

const AlertModal: React.FC<PropsWithChildren<TAlertModal>> = ({
  id,
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
  actionsClassName,
  cancelClassName,
  confirmClassName,
  childrenClassName,
}) => {
  return (
    <Modal
      id={id}
      openClassName={css.isOpen}
      className={css.modalRoot}
      title={title}
      isOpen={isOpen}
      handleClose={handleClose}
      containerClassName={classNames(css.container, containerClassName)}>
      <div className={classNames(css.children, childrenClassName)}>
        {children}
      </div>
      <div className={classNames(css.actions, actionsClassName)}>
        {cancelLabel && (
          <Button
            disabled={cancelDisabled}
            className={classNames(css.reject, cancelClassName)}
            variant="secondary"
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
