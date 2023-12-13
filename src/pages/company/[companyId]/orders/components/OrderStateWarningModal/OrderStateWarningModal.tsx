import React from 'react';

import AlertModal from '@components/Modal/AlertModal';

import css from './OrderStateWarningModal.module.scss';

type TOrderStateWarningModal = {
  isOpen: boolean;
  id: string;
  handleClose: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  content: string;
  title: string;
  confirmText?: string;
  confirmInProgress?: boolean;
  cancelText?: string;
  cancelInProgress?: boolean;
  shouldFullScreenInMobile?: boolean;
};

const OrderStateWarningModal: React.FC<TOrderStateWarningModal> = (props) => {
  const {
    content,
    title,
    confirmText,
    confirmInProgress,
    cancelText,
    cancelInProgress,
    shouldFullScreenInMobile,
    ...rest
  } = props;

  return (
    <AlertModal
      {...rest}
      title={title}
      cancelLabel={cancelText || 'Thoát'}
      confirmInProgress={confirmInProgress}
      cancelInProgress={cancelInProgress}
      shouldFullScreenInMobile={shouldFullScreenInMobile}
      confirmLabel={confirmText}>
      <div className={css.content}>{content}</div>
    </AlertModal>
  );
};

export default OrderStateWarningModal;
