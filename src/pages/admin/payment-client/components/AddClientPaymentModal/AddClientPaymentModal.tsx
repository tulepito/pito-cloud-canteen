import { useRef } from 'react';

import Modal from '@components/Modal/Modal';

import AddClientPaymentForm from '../AddClientPaymentForm/AddClientPaymentForm';

type TAddClientPaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  companyNameList: string[];
  paymentList: any[];
  onClientPaymentRecordsSubmit: (values: any) => void;
  inProgress?: boolean;
};

const AddClientPaymentModal: React.FC<TAddClientPaymentModalProps> = (
  props,
) => {
  const {
    isOpen,
    onClose,
    companyNameList,
    paymentList,
    onClientPaymentRecordsSubmit,
    inProgress,
  } = props;

  const selectInputRef = useRef<any>(null);

  const handleModalClose = () => {
    onClose();
    selectInputRef?.current?.clearValue();
  };

  return (
    <Modal
      id="AddClientPaymentModal.addCompanyPartner"
      isOpen={isOpen}
      title="Thêm thanh toán"
      handleClose={handleModalClose}>
      <AddClientPaymentForm
        onSubmit={onClientPaymentRecordsSubmit}
        companyNameList={companyNameList}
        unPaidPaymentList={paymentList}
        inProgress={inProgress}
        selectInputRef={selectInputRef}
      />
    </Modal>
  );
};

export default AddClientPaymentModal;
