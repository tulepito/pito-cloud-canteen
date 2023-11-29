import { useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldDateRangePicker from '@components/FormFields/FieldDateRangePicker/FieldDateRangePicker';
import { ETimePeriodOption } from '@src/utils/enums';

import css from './SelectTimeRangePeriodForm.module.scss';

export type TSelectTimeRangePeriodFormValues = {};

type TExtraProps = {
  onCloseModal: (e: React.MouseEvent<HTMLElement>) => void;
  onCloseCustomModal: () => void;
  startDate: number;
  endDate: number;
  setStartDate: (startDate: number) => void;
  setEndDate: (endDate: number) => void;
  handleTimePeriodChange: (timePeriod: ETimePeriodOption) => void;
};
type TSelectTimeRangePeriodFormComponentProps =
  FormRenderProps<TSelectTimeRangePeriodFormValues> & Partial<TExtraProps>;
type TSelectTimeRangePeriodFormProps =
  FormProps<TSelectTimeRangePeriodFormValues> & TExtraProps;

const SelectTimeRangePeriodFormComponent: React.FC<
  TSelectTimeRangePeriodFormComponentProps
> = (props) => {
  const {
    handleSubmit,
    onCloseCustomModal,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    onCloseModal,
    handleTimePeriodChange,
  } = props;

  const [startDateValue, setStartDateValue] = useState<Date | null>(
    new Date(startDate!),
  );
  const [endDateValue, setEndDateValue] = useState<Date | null>(
    new Date(endDate!),
  );

  const onSubmit = (e: React.MouseEvent<HTMLElement>) => {
    setStartDate?.(startDateValue?.getTime()!);
    setEndDate?.(endDateValue?.getTime()!);
    handleTimePeriodChange?.(ETimePeriodOption.CUSTOM);
    onCloseCustomModal?.();
    onCloseModal?.(e);
  };

  return (
    <Form className={css.formContainer} onSubmit={handleSubmit}>
      <FieldDateRangePicker
        id="dateRangeField"
        name="dateRangeField"
        selected={new Date(startDate!)}
        onChange={(_values: [Date | null, Date | null]) => {
          setStartDateValue(_values[0]);
          setEndDateValue(_values[1]);
        }}
        startDate={startDateValue}
        endDate={endDateValue}
        fieldWrapperClassName={css.fieldDateInputWrapper}
      />
      <div className={css.bottomButons}>
        <Button
          variant="inline"
          className={css.button}
          onClick={onCloseCustomModal}>
          Huỷ
        </Button>
        <Button
          type="submit"
          variant="primary"
          className={css.button}
          onClick={onSubmit}>
          Áp dụng
        </Button>
      </div>
    </Form>
  );
};

const SelectTimeRangePeriodForm: React.FC<TSelectTimeRangePeriodFormProps> = (
  props,
) => {
  return (
    <FinalForm {...props} component={SelectTimeRangePeriodFormComponent} />
  );
};

export default SelectTimeRangePeriodForm;
