import { useEffect, useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldDateRangePicker from '@components/FormFields/FieldDateRangePicker/FieldDateRangePicker';
import FieldRadioButton from '@components/FormFields/FieldRadioButton/FieldRadioButton';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { timePeriodOptions } from '@pages/partner/hooks/useControlTimeRange';
import { ETimePeriodOption } from '@src/utils/enums';

import css from './SelectTimePeriodForm.module.scss';

export type TSelectTimePeriodFormValues = {
  timePeriod: string;
  dateRangeField: [Date | null, Date | null];
};

type TExtraProps = {
  shouldShowCustomSelect: boolean;
  onCustomSelectClick: () => void;
  onCloseModal: (e: React.MouseEvent<HTMLElement>) => void;
  onBackToTimePeriodSelectClick: () => void;
  startDate: number;
  endDate: number;
  setStartDate: (startDate: number) => void;
  setEndDate: (endDate: number) => void;
  handleTimePeriodChange: (timePeriod: ETimePeriodOption) => void;
  resetTimePeriod: () => void;
};
type TSelectTimePeriodFormComponentProps =
  FormRenderProps<TSelectTimePeriodFormValues> & Partial<TExtraProps>;
type TSelectTimePeriodFormProps = FormProps<TSelectTimePeriodFormValues> &
  TExtraProps;

const SelectTimePeriodFormComponent: React.FC<
  TSelectTimePeriodFormComponentProps
> = (props) => {
  const {
    handleSubmit,
    shouldShowCustomSelect,
    onCustomSelectClick,
    values,
    onCloseModal,
    onBackToTimePeriodSelectClick,
    form,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    handleTimePeriodChange,
    resetTimePeriod,
  } = props;

  const [startDateValue, setStartDateValue] = useState<Date | null>(
    new Date(startDate!),
  );
  const [endDateValue, setEndDateValue] = useState<Date | null>(
    new Date(endDate!),
  );

  const onCancel = (e: React.MouseEvent<HTMLElement>) => {
    if (shouldShowCustomSelect) {
      onBackToTimePeriodSelectClick?.();
    } else {
      resetTimePeriod?.();
      onCloseModal?.(e);
    }
  };

  const onSubmit = (e: React.MouseEvent<HTMLElement>) => {
    if (shouldShowCustomSelect) {
      onBackToTimePeriodSelectClick?.();
    } else {
      if (values.timePeriod === ETimePeriodOption.CUSTOM) {
        setStartDate?.(startDateValue?.getTime()!);
        setEndDate?.(endDateValue?.getTime()!);
      }
      handleTimePeriodChange?.(values.timePeriod! as ETimePeriodOption);
      onCloseModal?.(e);
    }
  };

  useEffect(() => {
    if (shouldShowCustomSelect) {
      form.change('timePeriod', ETimePeriodOption.CUSTOM);
    }
  }, [form, shouldShowCustomSelect, values.timePeriod]);

  return (
    <Form onSubmit={handleSubmit}>
      <RenderWhen condition={shouldShowCustomSelect}>
        <div className={css.customSelectText}>Tuỳ chỉnh</div>
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
        <RenderWhen.False>
          {timePeriodOptions.map(({ key, label }) => (
            <FieldRadioButton
              key={key}
              id={`timePeriod-${key}`}
              name="timePeriod"
              label={label}
              value={key}
            />
          ))}
          <div
            className={css.customSelectWrapper}
            onClick={onCustomSelectClick}>
            <div className={css.customSelectText}>Tuỳ chỉnh</div>
            <IconArrow direction="right" />
          </div>
        </RenderWhen.False>
      </RenderWhen>

      <div className={css.bottomButons}>
        <Button variant="secondary" className={css.button} onClick={onCancel}>
          {shouldShowCustomSelect ? 'Hủy' : 'Xoá bộ lọc'}
        </Button>
        <Button
          type="submit"
          variant="primary"
          className={css.button}
          onClick={onSubmit}>
          {shouldShowCustomSelect ? 'Áp dụng' : 'Lọc'}
        </Button>
      </div>
    </Form>
  );
};

const SelectTimePeriodForm: React.FC<TSelectTimePeriodFormProps> = (props) => {
  return <FinalForm {...props} component={SelectTimePeriodFormComponent} />;
};

export default SelectTimePeriodForm;
