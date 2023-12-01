import { useState } from 'react';

import Button from '@components/Button/Button';
import FieldDatePicker from '@components/FormFields/FieldDatePicker/FieldDatePicker';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { findValidRangeForDeadlineDate } from '@helpers/order/prepareDataHelper';

import type { TMealDateFormValues } from '../MealDateForm/MealDateForm';

import css from './OrderDeadlineDateFieldModal.module.scss';

type OrderDeadlineDateFieldModalProps = {
  onClose: () => void;
  form: any;
  values: Partial<TMealDateFormValues>;
  startOrderDate: Date | null;
};

const OrderDeadlineDateFieldModal: React.FC<
  OrderDeadlineDateFieldModalProps
> = (props) => {
  const { onClose, values, form, startOrderDate } = props;
  const { deadlineDate } = values;
  const initialOrderDeadlineDate = deadlineDate ? new Date(deadlineDate) : null;

  const [orderDeadline, setOrderDeadline] = useState<Date | null>(
    initialOrderDeadlineDate,
  );
  const { minSelectedDate, maxSelectedDate } = findValidRangeForDeadlineDate(
    startOrderDate!,
  );

  const submitDisabled =
    !orderDeadline ||
    !values?.orderDeadlineHour ||
    !values?.orderDeadlineMinute;

  const handleOrderDeadlineFieldChange = (_values: any) => {
    setOrderDeadline(_values);
  };

  const handleOrderDeadlineHourFieldChange = (_values: any) => {
    if (
      /^\d*$/.test(_values) &&
      parseInt(_values, 10) >= 0 &&
      parseInt(_values, 10) <= 23
    ) {
      return _values;
    }
  };

  const handleOrderDeadlineMinuteFieldChange = (_values: any) => {
    if (
      /^\d*$/.test(_values) &&
      parseInt(_values, 10) >= 0 &&
      parseInt(_values, 10) <= 59
    ) {
      return _values;
    }
  };

  const handleSubmit = () => {
    form.change('deadlineDate', orderDeadline);
    onClose();
  };

  return (
    <div className={css.container}>
      <FieldDatePicker
        id="orderDeadline"
        name="orderDeadline"
        selected={orderDeadline}
        onChange={handleOrderDeadlineFieldChange}
        autoComplete="off"
        inline
        shouldHideBoxShadow
        minDate={minSelectedDate}
        maxDate={maxSelectedDate}
      />
      <div className={css.timeInputWrapper}>
        <FieldTextInput
          id="orderDeadlineHour"
          name="orderDeadlineHour"
          className={css.timeInput}
          parse={handleOrderDeadlineHourFieldChange}
        />
        :
        <FieldTextInput
          id="orderDeadlineMinute"
          name="orderDeadlineMinute"
          className={css.timeInput}
          parse={handleOrderDeadlineMinuteFieldChange}
        />
      </div>
      <div className={css.bottomBtns}>
        <Button variant="inline" type="button" onClick={onClose}>
          Huỷ
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={submitDisabled}>
          Áp dụng
        </Button>
      </div>
    </div>
  );
};

export default OrderDeadlineDateFieldModal;
