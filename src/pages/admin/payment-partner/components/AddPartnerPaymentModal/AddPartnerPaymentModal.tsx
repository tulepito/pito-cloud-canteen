import { useRef } from 'react';

import Modal from '@components/Modal/Modal';

import AddPartnerPaymentForm from '../AddPartnerPaymentForm/AddPartnerPaymentForm';

type TAddPartnerPaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  partnerNameList: string[];
  paymentList: any[];
  onPartnerPaymentRecordsSubmit: (values: any) => void;
  inProgress?: boolean;
};

const AddPartnerPaymentModal: React.FC<TAddPartnerPaymentModalProps> = (
  props,
) => {
  const {
    isOpen,
    onClose,
    partnerNameList,
    paymentList,
    onPartnerPaymentRecordsSubmit,
    inProgress,
  } = props;

  const selectInputRef = useRef<any>(null);

  const handleModalClose = () => {
    onClose();
    selectInputRef?.current?.clearValue();
  };

  return (
    <Modal
      id="AddPartnerPaymentModal"
      isOpen={isOpen}
      title="Thêm thanh toán"
      handleClose={handleModalClose}>
      <AddPartnerPaymentForm
        onSubmit={onPartnerPaymentRecordsSubmit}
        partnerNameList={partnerNameList}
        unPaidPaymentList={paymentList}
        inProgress={inProgress}
        selectInputRef={selectInputRef}
      />
    </Modal>
  );
};

export default AddPartnerPaymentModal;
