import { useEffect, useState } from 'react';
import classNames from 'classnames';

import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import {
  parseThousandNumber,
  parseThousandNumberToInteger,
} from '@helpers/format';
import useBoolean from '@hooks/useBoolean';
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
    values,
    id,
  } = props;
  const showPercentageController = useBoolean();
  const [percentage, setPercentage] = useState(0);

  const paymentAmountValue =
    values?.[`paymentAmount - ${orderTitle} - ${id}`] || 0;

  const rightIconContainerClasses = classNames(css.rightIcon, {
    [css.rightIconActive]: showPercentageController.value,
  });

  useEffect(() => {
    if (
      parseThousandNumberToInteger(`${paymentAmountValue}`) >
      totalAmount - paidAmount
    ) {
      form.change(
        `paymentAmount - ${orderTitle} - ${id}`,
        parseThousandNumber(`${totalAmount - paidAmount}`),
      );
    }
  }, [form, orderTitle, paidAmount, paymentAmountValue, totalAmount, id]);

  useEffect(() => {
    if (percentage !== 0) {
      form.change(
        `paymentAmount - ${orderTitle} - ${id}`,
        parseThousandNumber((totalAmount * percentage) / 100),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percentage]);

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
          showPercentageController={showPercentageController}
        />
      }
      rightIconContainerClassName={rightIconContainerClasses}
      parse={handleParseInputValue}
    />
  );
};

export default AddingClientTableField;
