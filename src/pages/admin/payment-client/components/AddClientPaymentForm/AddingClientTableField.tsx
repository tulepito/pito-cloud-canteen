import { useEffect, useState } from 'react';

import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import {
  parseThousandNumber,
  parseThousandNumberToInteger,
} from '@helpers/format';
import { PaymentPercentageDropdown } from '@pages/admin/order/[orderId]/tabs/OrderPaymentStatusTab/components/AddingPaymentRecordForm/AddingPaymentRecordForm';

import css from './AddClientPaymentForm.module.scss';

type TAddClientPaymentFormValues = {
  totalAmount: number;
  paidAmount: number;
  orderTitle: string;
  subOrderDate: string;
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
    subOrderDate,
    form,
    values,
    id,
  } = props;
  const [percentage, setPercentage] = useState(0);

  const paymentAmountValue =
    values?.[`paymentAmount - ${orderTitle} - ${subOrderDate} - ${id}`] || 0;

  useEffect(() => {
    if (
      parseThousandNumberToInteger(`${paymentAmountValue}`) >
      totalAmount - paidAmount
    ) {
      form.change(
        `paymentAmount - ${orderTitle} - ${subOrderDate} - ${id}`,
        parseThousandNumber(`${totalAmount - paidAmount}`),
      );
    }
  }, [
    form,
    orderTitle,
    paidAmount,
    paymentAmountValue,
    subOrderDate,
    totalAmount,
    id,
  ]);

  useEffect(() => {
    if (percentage !== 0) {
      form.change(
        `paymentAmount - ${orderTitle} - ${subOrderDate} - ${id}`,
        parseThousandNumber((totalAmount * percentage) / 100),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percentage]);

  return (
    <FieldTextInput
      id={`paymentAmount - ${orderTitle} - ${subOrderDate} - ${id}`}
      name={`paymentAmount - ${orderTitle} - ${subOrderDate} - ${id}`}
      placeholder="Nhập số"
      rightIcon={
        <PaymentPercentageDropdown
          totalPrice={totalAmount}
          paidAmount={paidAmount}
          percentage={percentage}
          setPercentage={setPercentage}
        />
      }
      rightIconContainerClassName={css.rightIcon}
      parse={handleParseInputValue}
    />
  );
};

export default AddingClientTableField;
