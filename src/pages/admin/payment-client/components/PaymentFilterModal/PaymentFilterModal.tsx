import Modal from '@components/Modal/Modal';

import type { TPaymentFilterFormValues } from '../PaymentFilterForm/PaymentFilterForm';
import PaymentFilterForm from '../PaymentFilterForm/PaymentFilterForm';

import css from './PaymentFilterModal.module.scss';

type PaymentFilterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  setFilters: (filter: TPaymentFilterFormValues) => void;
  initialValues?: TPaymentFilterFormValues;
};

const PaymentFilterModal: React.FC<PaymentFilterModalProps> = (props) => {
  const { isOpen, onClose, setFilters, initialValues } = props;
  const handleFilterSubmit = (values: TPaymentFilterFormValues) => {
    const {
      companyName,
      orderTitle,
      startDate,
      endDate,
      status,
      restaurantName,
    } = values;
    setFilters({
      ...(companyName && { companyName }),
      ...(orderTitle && { orderTitle }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(status && { status }),
      ...(restaurantName && { restaurantName }),
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
        initialValues={initialValues}
      />
    </Modal>
  );
};

export default PaymentFilterModal;
