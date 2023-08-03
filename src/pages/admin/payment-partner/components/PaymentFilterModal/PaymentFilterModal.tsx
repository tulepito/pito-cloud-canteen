import { useRef } from 'react';

import type { TPaymentFilterFormValues } from '../PaymentFilterForm/PaymentFilterForm';
import PaymentFilterForm from '../PaymentFilterForm/PaymentFilterForm';

import css from './PaymentFilterModal.module.scss';

type PaymentFilterModalProps = {
  setFilters: (filter: TPaymentFilterFormValues) => void;
  setPage: (page: number) => void;
};

const PaymentFilterModal: React.FC<PaymentFilterModalProps> = (props) => {
  const { setFilters, setPage } = props;
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

    // onClose();
  };

  const handleClearFilters = () => {
    setFilters({});
    formRef?.current?.reset();
    // onClose();
  };

  return (
    <div className={css.container}>
      <PaymentFilterForm
        onSubmit={handleFilterSubmit}
        handleClearFilters={handleClearFilters}
        formRef={formRef}
      />
    </div>
  );
};

export default PaymentFilterModal;
