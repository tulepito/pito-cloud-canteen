import type { PropsWithChildren, ReactNode } from 'react';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';

import Button from '@components/Button/Button';
import RenderWhen from '@components/RenderWhen/RenderWhen';

import Modal from './Modal';

import css from './AlertModal.module.scss';

type TAlertModal = {
  id?: string;
  isOpen: boolean;
  title?: string | ReactNode;
  className?: string;
  cancelLabel?: ReactNode;
  confirmLabel?: ReactNode;
  handleClose: () => void;
  onCancel?: () => void;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  confirmInProgress?: boolean;
  cancelDisabled?: boolean;
  cancelInProgress?: boolean;
  containerClassName?: string;
  actionsClassName?: string;
  cancelClassName?: string;
  confirmClassName?: string;
  childrenClassName?: string;
  shouldFullScreenInMobile?: boolean;
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
  shouldFullScreenInMobile = true,
  cancelInProgress = false,
}) => {
  const shouldShowCancelButton =
    !isEmpty(cancelLabel) && typeof onCancel !== 'undefined';
  const shouldShowConfirmButton =
    !isEmpty(confirmLabel) && typeof onConfirm !== 'undefined';
  const shouldShowActionSection =
    shouldShowCancelButton || shouldShowConfirmButton;

  const childrenClasses = classNames(css.children, childrenClassName, {
    [css.hasActionSection]: shouldShowActionSection,
  });

  return (
    <Modal
      id={id}
      openClassName={css.isOpen}
      className={css.modalRoot}
      title={title}
      isOpen={isOpen}
      handleClose={handleClose}
      containerClassName={classNames(css.container, containerClassName)}
      shouldFullScreenInMobile={shouldFullScreenInMobile}>
      <div className={childrenClasses}>{children}</div>
      <div className={classNames(css.actions, actionsClassName)}>
        <RenderWhen condition={shouldShowCancelButton}>
          <Button
            type="button"
            disabled={cancelDisabled}
            className={classNames(css.reject, cancelClassName)}
            variant="secondary"
            size="medium"
            inProgress={cancelInProgress}
            onClick={onCancel}>
            {cancelLabel}
          </Button>
        </RenderWhen>
        <RenderWhen condition={shouldShowConfirmButton}>
          <Button
            type="button"
            disabled={confirmDisabled}
            inProgress={confirmInProgress}
            className={classNames(css.confirm, confirmClassName)}
            size="medium"
            onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </RenderWhen>
      </div>
    </Modal>
  );
};

export default AlertModal;
