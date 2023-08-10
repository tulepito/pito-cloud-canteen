import { useMemo, useRef } from 'react';

import type { TPaymentFilterFormValues } from '../PaymentFilterForm/PaymentFilterForm';
import PaymentFilterForm from '../PaymentFilterForm/PaymentFilterForm';

import css from './PaymentFilterModal.module.scss';

type PaymentFilterModalProps = {
  setFilters: (filter: TPaymentFilterFormValues) => void;
  setPage: (page: number) => void;
  onClose: () => void;
  filters: TPaymentFilterFormValues;
};

const PaymentFilterModal: React.FC<PaymentFilterModalProps> = (props) => {
  const { setFilters, setPage, onClose, filters } = props;
  const formRef = useRef<any>();

  const initialValues = useMemo(
    () => ({
      partnerName: filters?.partnerName,
      orderTitle: filters?.orderTitle,
      startDate: filters?.startDate,
      endDate: filters?.endDate,
      status: filters?.status,
    }),
    [
      filters?.endDate,
      filters?.orderTitle,
      filters?.partnerName,
      filters?.startDate,
      filters?.status,
    ],
  );

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
    <div className={css.container}>
      <PaymentFilterForm
        onSubmit={handleFilterSubmit}
        handleClearFilters={handleClearFilters}
        formRef={formRef}
        initialValues={initialValues}
      />
    </div>
  );
};

export default PaymentFilterModal;
