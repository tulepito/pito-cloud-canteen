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
};

const OrderStateWarningModal: React.FC<TOrderStateWarningModal> = (props) => {
  const { content, title, ...rest } = props;

  return (
    <AlertModal
      {...rest}
      title={title}
      cancelLabel="Thoát"
      confirmLabel="Đặt đơn mới">
      <div className={css.content}>{content}</div>
    </AlertModal>
  );
};

export default OrderStateWarningModal;
