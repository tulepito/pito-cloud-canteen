/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import classNames from 'classnames';

import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import {
  parseThousandNumber,
  parseThousandNumberToInteger,
} from '@helpers/format';
import useBoolean from '@hooks/useBoolean';
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
    values,
    id,
  } = props;
  const showPercentageController = useBoolean();
  const [percentage, setPercentage] = useState(0);

  const fieldName = `paymentAmount - ${orderTitle} - ${subOrderDate} - ${id}`;
  const paymentAmountValue = values?.[fieldName] || 0;

  const rightIconContainerClasses = classNames(css.rightIcon, {
    [css.rightIconActive]: showPercentageController.value,
  });

  useEffect(() => {
    if (
      paidAmount <= totalAmount &&
      parseThousandNumberToInteger(`${paymentAmountValue}`) >
        totalAmount - paidAmount
    ) {
      form.change(
        fieldName,
        parseThousandNumber(`${totalAmount - paidAmount}`),
      );
    }
  }, [fieldName, paidAmount, paymentAmountValue, totalAmount]);

  useEffect(() => {
    if (percentage !== 0) {
      form.change(
        `paymentAmount - ${orderTitle} - ${subOrderDate} - ${id}`,
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
          showPercentageController={showPercentageController}
        />
      }
      rightIconContainerClassName={rightIconContainerClasses}
      parse={handleParseInputValue}
    />
  );
};

export default AddingPaymentTableField;
