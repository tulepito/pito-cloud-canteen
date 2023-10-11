/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';

import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { parseThousandNumber } from '@helpers/format';
import { PaymentPercentageDropdown } from '@pages/admin/order/[orderId]/tabs/OrderPaymentStatusTab/components/AddingPaymentRecordForm/AddingPaymentRecordForm';

import css from './AddPartnerPaymentForm.module.scss';

type TAddPartnerPaymentFormValues = {
  totalAmount: number;
  paidAmount: number;
  orderTitle: string;
  subOrderDate: string;
  handleParseInputValue: (value: string) => string;
  form: any;
  values: any;
  id: string;
};

const AddingPaymentTableField: React.FC<TAddPartnerPaymentFormValues> = (
  props,
) => {
  const {
    totalAmount = 0,
    paidAmount = 0,
    handleParseInputValue,
    orderTitle,
    subOrderDate,
    form,
    id,
  } = props;
  const [percentage, setPercentage] = useState(0);
  const fieldName = `paymentAmount - ${orderTitle} - ${subOrderDate} - ${id}`;

  useEffect(() => {
    if (percentage !== 0) {
      form.change(
        fieldName,
        parseThousandNumber(Math.round((totalAmount * percentage) / 100)),
      );
    }
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

export default AddingPaymentTableField;
