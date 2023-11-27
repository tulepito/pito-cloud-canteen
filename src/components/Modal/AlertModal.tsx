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
  headerClassName?: string;
  cancelClassName?: string;
  confirmClassName?: string;
  childrenClassName?: string;
  shouldFullScreenInMobile?: boolean;
  shouldHideIconClose?: boolean;
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
  headerClassName,
  actionsClassName,
  cancelClassName,
  confirmClassName,
  childrenClassName,
  shouldFullScreenInMobile = true,
  shouldHideIconClose = false,
  cancelInProgress = false,
}) => {
  const shouldShowCancelButton =
    !isEmpty(cancelLabel) && typeof onCancel !== 'undefined';
  const shouldShowConfirmButton =
    !isEmpty(confirmLabel) && typeof onConfirm !== 'undefined';
  const shouldShowActionSection =
    shouldShowCancelButton || shouldShowConfirmButton;

  const childrenClasses = classNames(
    css.children,
    {
      [css.hasActionSection]: shouldShowActionSection,
    },
    childrenClassName,
  );

  return (
    <Modal
      id={id}
      openClassName={css.isOpen}
      className={css.modalRoot}
      title={title}
      isOpen={isOpen}
      handleClose={handleClose}
      shouldHideIconClose={shouldHideIconClose}
      containerClassName={classNames(css.container, containerClassName)}
      headerClassName={headerClassName}
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
