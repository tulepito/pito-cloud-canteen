import { useMemo } from 'react';
import { useForm } from 'react-final-form-hooks';
import { FormattedMessage } from 'react-intl';
import difference from 'lodash/difference';

import Button from '@components/Button/Button';

import BasicDayInWeekField from '../../BasicDayInWeekField/BasicDayInWeekField';

import css from './ApplyOtherDaysForm.module.scss';

type TApplyOtherDaysFormProps = {
  onSubmit: (values: TApplyOtherDaysFormValues) => void;
  onCancel: () => void;
  initialValues?: TApplyOtherDaysFormValues;
  dayInWeek?: string[];
  inProgress?: boolean;
};

export type TApplyOtherDaysFormValues = {
  selectedDays: string[];
};

const validate = (values: TApplyOtherDaysFormValues) => {
  const errors: any = {};
  if (!values.selectedDays) {
    errors.selectedDays = 'Required';
  }
  return errors;
};

const ApplyOtherDaysForm: React.FC<TApplyOtherDaysFormProps> = ({
  onSubmit,
  onCancel,
  initialValues,
  dayInWeek = [],
  inProgress,
}) => {
  const { form, handleSubmit, submitting, hasValidationErrors, values } =
    useForm<TApplyOtherDaysFormValues>({
      onSubmit,
      validate,
      initialValues,
    });

  const disabledSubmit = submitting || hasValidationErrors;
  const disabledDates = useMemo(
    () =>
      difference(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], dayInWeek),
    [dayInWeek],
  );
  return (
    <form className={css.root} onSubmit={handleSubmit}>
      <BasicDayInWeekField
        form={form}
        values={values}
        disabledDates={disabledDates}
      />

      <Button
        className={css.submitBtn}
        type="submit"
        disabled={disabledSubmit}
        inProgress={inProgress}
        spinnerClassName={css.spinnerClassName}>
        <FormattedMessage id="ApplyOtherDaysForm.submit" />
      </Button>
      <Button
        onClick={onCancel}
        className={css.cancelBtn}
        variant="inline"
        spinnerClassName={css.spinnerClassName}>
        <FormattedMessage id="ApplyOtherDaysForm.cancel" />
      </Button>
    </form>
  );
};

export default ApplyOtherDaysForm;
