import Modal from '@components/Modal/Modal';

import AddingPaymentRecordForm from '../AddingPaymentRecordForm/AddingPaymentRecordForm';

import css from './AddingPaymentRecordModal.module.scss';

type AddingPaymentRecordModalProps = {
  isOpen: boolean;
  handleClose: () => void;
  onPaymentSubmit: (values: any) => void;
  totalPrice: number;
  paidAmount: number;
  inProgress?: boolean;
};

const AddingPaymentRecordModal: React.FC<AddingPaymentRecordModalProps> = (
  props,
) => {
  const {
    isOpen,
    handleClose,
    onPaymentSubmit,
    totalPrice,
    paidAmount,
    inProgress,
  } = props;

  return (
    <Modal
      id="AddingPaymentRecordModal"
      isOpen={isOpen}
      handleClose={handleClose}
      containerClassName={css.modalContainer}
      title="Thêm thanh toán">
      <AddingPaymentRecordForm
        onSubmit={onPaymentSubmit}
        totalPrice={totalPrice}
        paidAmount={paidAmount}
        inProgress={inProgress}
      />
    </Modal>
  );
};

export default AddingPaymentRecordModal;
