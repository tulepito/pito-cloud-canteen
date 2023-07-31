import { useRef } from 'react';

import Modal from '@components/Modal/Modal';

import type { TPaymentFilterFormValues } from '../PaymentFilterForm/PaymentFilterForm';
import PaymentFilterForm from '../PaymentFilterForm/PaymentFilterForm';

import css from './PaymentFilterModal.module.scss';

type PaymentFilterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  setFilters: (filter: TPaymentFilterFormValues) => void;
  setPage: (page: number) => void;
};

const PaymentFilterModal: React.FC<PaymentFilterModalProps> = (props) => {
  const { isOpen, onClose, setFilters, setPage } = props;
  const formRef = useRef<any>();

  const handleFilterSubmit = (values: TPaymentFilterFormValues) => {
    const { partnerName, orderTitle, startDate, endDate, status } = values;

    setFilters({
      ...(partnerName && { partnerName }),
      ...(orderTitle && { orderTitle }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(status && { status }),
    });
    setPage(1);

    onClose();
  };

  const handleClearFilters = () => {
    setFilters({});
    formRef?.current?.reset();
    onClose();
  };

  return (
    <Modal
      id="PaymentFilterModal"
      isOpen={isOpen}
      handleClose={onClose}
      containerClassName={css.modalContainer}
      title="Lọc">
      <PaymentFilterForm
        onSubmit={handleFilterSubmit}
        handleClearFilters={handleClearFilters}
        formRef={formRef}
      />
    </Modal>
  );
};

export default PaymentFilterModal;
