import { useEffect, useState } from 'react';

import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { parseThousandNumber } from '@helpers/format';
import { PaymentPercentageDropdown } from '@pages/admin/order/[orderId]/tabs/OrderPaymentStatusTab/components/AddingPaymentRecordForm/AddingPaymentRecordForm';

import css from './AddClientPaymentForm.module.scss';

type TAddClientPaymentFormValues = {
  totalAmount: number;
  paidAmount: number;
  orderTitle: string;
  handleParseInputValue: (value: string) => string;
  form: any;
  values: any;
  id: string;
};

const AddingClientTableField: React.FC<TAddClientPaymentFormValues> = (
  props,
) => {
  const {
    totalAmount = 0,
    paidAmount = 0,
    handleParseInputValue,
    orderTitle,
    form,
    id,
  } = props;
  const [percentage, setPercentage] = useState(0);
  const fieldName = `paymentAmount - ${orderTitle} - ${id}`;

  useEffect(() => {
    if (percentage !== 0) {
      form.change(
        fieldName,
        parseThousandNumber((totalAmount * percentage) / 100),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percentage, fieldName]);

  return (
    <FieldTextInput
      id={`paymentAmount - ${orderTitle} - ${id}`}
      name={`paymentAmount - ${orderTitle} - ${id}`}
      placeholder="Nhập số"
      inputContainerClassName={css.paymentFieldContainer}
      rightIcon={
        <PaymentPercentageDropdown
          totalPrice={totalAmount}
          paidAmount={paidAmount}
          percentage={percentage}
          setPercentage={setPercentage}
          hasOnlyMaxOption
        />
      }
      rightIconContainerClassName={css.rightIcon}
      parse={handleParseInputValue}
    />
  );
};

export default AddingClientTableField;
