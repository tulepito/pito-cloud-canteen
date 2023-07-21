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
};

const OrderStateWarningModal: React.FC<TOrderStateWarningModal> = (props) => {
  const { content, ...rest } = props;

  return (
    <AlertModal
      {...rest}
      title="Đơn Hàng Đã Hủy"
      cancelLabel="Thoát"
      confirmLabel="Đặt đơn mới">
      <div className={css.content}>{content}</div>
    </AlertModal>
  );
};

export default OrderStateWarningModal;
