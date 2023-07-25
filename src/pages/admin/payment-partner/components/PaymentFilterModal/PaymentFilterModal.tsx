import Modal from '@components/Modal/Modal';

import type { TPaymentFilterFormValues } from '../PaymentFilterForm/PaymentFilterForm';
import PaymentFilterForm from '../PaymentFilterForm/PaymentFilterForm';

import css from './PaymentFilterModal.module.scss';

type PaymentFilterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  setFilters: (filter: TPaymentFilterFormValues) => void;
};

const PaymentFilterModal: React.FC<PaymentFilterModalProps> = (props) => {
  const { isOpen, onClose, setFilters } = props;

  const handleFilterSubmit = (values: TPaymentFilterFormValues) => {
    const { partnerName, orderTitle, startDate, endDate, status } = values;

    setFilters({
      ...(partnerName && { partnerName }),
      ...(orderTitle && { orderTitle }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(status && { status }),
    });

    onClose();
  };

  const handleClearFilters = () => {
    setFilters({});
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
      />
    </Modal>
  );
};

export default PaymentFilterModal;
