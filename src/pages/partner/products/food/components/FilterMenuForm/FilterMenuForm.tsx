import { useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldDatePicker from '@components/FormFields/FieldDatePicker/FieldDatePicker';

import css from './FilterMenuForm.module.scss';

export type TFilterMenuFormValues = {
  startDate?: number;
  endDate?: number;
};

type TExtraProps = {};
type TFilterMenuFormComponentProps = FormRenderProps<TFilterMenuFormValues> &
  Partial<TExtraProps>;
type TFilterMenuFormProps = FormProps<TFilterMenuFormValues> & TExtraProps;

const FilterMenuFormComponent: React.FC<TFilterMenuFormComponentProps> = (
  props,
) => {
  const { handleSubmit, form } = props;
  const [startDate, setStartDate] = useState<Date>(null!);
  const [endDate, setEndDate] = useState<Date>(null!);
  const handleStartDateChange = (date: Date) => {
    setStartDate(date);

    if (endDate !== null && date > endDate) {
      setEndDate(null!);
      form.change('endDate', null!);
    }
  };

  const handleEndDateChange = (date: Date) => {
    setEndDate(date);
  };

  const handleResetForm = () => {
    setStartDate(null!);
    setEndDate(null!);
    form.reset();
  };

  return (
    <Form onSubmit={handleSubmit} className={css.root}>
      <div className={css.label}>Lọc theo thời gian</div>
      <div className={css.dateInputGroup}>
        <FieldDatePicker
          id="startDate"
          name="startDate"
          selected={startDate}
          onChange={handleStartDateChange}
          autoComplete="off"
          dateFormat={'EEE, dd MMMM, yyyy'}
          placeholderText="Từ"
          popperPlacement="top-start"
        />
        <FieldDatePicker
          id="endDate"
          name="endDate"
          onChange={handleEndDateChange}
          selected={endDate}
          minDate={startDate}
          dateFormat={'EEE, dd MMMM, yyyy'}
          autoComplete="off"
          disabled={!startDate}
          placeholderText="Đến"
          popperPlacement="top-start"
        />
      </div>
      <div className={css.bottomBtns}>
        <Button
          className={css.btn}
          variant="secondary"
          onClick={handleResetForm}>
          Bỏ lọc
        </Button>
        <Button className={css.btn} type="submit">
          Lọc
        </Button>
      </div>
    </Form>
  );
};

const FilterMenuForm: React.FC<TFilterMenuFormProps> = (props) => {
  return <FinalForm {...props} component={FilterMenuFormComponent} />;
};

export default FilterMenuForm;
