import { useEffect, useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldDateRangePicker from '@components/FormFields/FieldDateRangePicker/FieldDateRangePicker';
import FieldRadioButton from '@components/FormFields/FieldRadioButton/FieldRadioButton';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import {
  timePeriodOptions,
  useControlTimeRange,
} from '@pages/partner/hooks/useControlTimeRange';
import type { ETimePeriodOption } from '@src/utils/enums';

import css from './SelectTimePeriodForm.module.scss';

export type TSelectTimePeriodFormValues = {
  timePeriod: string;
  dateRangeField: [Date | null, Date | null];
};

type TExtraProps = {
  shouldShowCustomSelect: boolean;
  onCustomSelectClick: () => void;
  onCloseModal: () => void;
  onBackToTimePeriodSelectClick: () => void;
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
  } = props;
  const {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    handleTimePeriodChange,
    resetTimePeriod,
  } = useControlTimeRange();

  const [startDateValue, setStartDateValue] = useState<number | null>(
    startDate,
  );
  const [endDateValue, setEndDateValue] = useState<number | null>(endDate);

  const onCancel = () => {
    if (shouldShowCustomSelect) {
      onBackToTimePeriodSelectClick?.();
    } else {
      resetTimePeriod();
    }
  };

  const onSubmit = () => {
    if (shouldShowCustomSelect) {
      onBackToTimePeriodSelectClick?.();
    } else {
      if (values.timePeriod === 'custom') {
        setStartDate(startDateValue!);
        setEndDate(endDateValue!);
      } else {
        handleTimePeriodChange(values.timePeriod! as ETimePeriodOption);
      }
      onCloseModal?.();
    }
  };

  useEffect(() => {
    if (shouldShowCustomSelect) {
      form.change('timePeriod', 'custom');
    }
  }, [form, shouldShowCustomSelect, values.timePeriod]);

  return (
    <Form onSubmit={handleSubmit}>
      <RenderWhen condition={shouldShowCustomSelect}>
        <div className={css.customSelectText}>Tuỳ chỉnh</div>
        <FieldDateRangePicker
          id="dateRangeField"
          name="dateRangeField"
          selected={startDate}
          onChange={(_values: [Date | null, Date | null]) => {
            setStartDateValue(_values[0]?.getTime()!);
            setEndDateValue(_values[1]?.getTime()!);
          }}
          startDate={startDateValue}
          endDate={endDateValue}
        />
        <RenderWhen.False>
          <>
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
          </>
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
