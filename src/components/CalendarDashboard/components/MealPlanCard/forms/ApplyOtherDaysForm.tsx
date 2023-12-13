import { useMemo } from 'react';
import { useForm } from 'react-final-form-hooks';
import { FormattedMessage } from 'react-intl';
import difference from 'lodash/difference';
import { DateTime } from 'luxon';

import Button from '@components/Button/Button';
import { convertWeekDay, renderDateRange } from '@src/utils/dates';

import BasicDayInWeekField from '../../BasicDayInWeekField/BasicDayInWeekField';

import css from './ApplyOtherDaysForm.module.scss';

type TApplyOtherDaysFormProps = {
  onSubmit: (values: TApplyOtherDaysFormValues) => void;
  onCancel: () => void;
  initialValues?: TApplyOtherDaysFormValues;
  dayInWeek?: string[];
  inProgress?: boolean;
  startDate?: Date | number;
  endDate?: Date | number;
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
  inProgress,
  startDate,
  endDate,
}) => {
  const { form, handleSubmit, submitting, hasValidationErrors, values } =
    useForm<TApplyOtherDaysFormValues>({
      onSubmit,
      validate,
      initialValues,
    });

  const disabledSubmit = submitting || hasValidationErrors;
  const usableStartDate =
    typeof startDate === 'number' ? startDate : startDate?.getTime();
  const usableEndDate =
    typeof endDate === 'number' ? endDate : endDate?.getTime();
  const visibleDayInWeek = renderDateRange(usableStartDate, usableEndDate).map(
    (_day) => convertWeekDay(DateTime.fromMillis(_day).weekday).key,
  );
  const disabledDates = useMemo(
    () =>
      difference(
        ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
        visibleDayInWeek,
      ),
    [visibleDayInWeek],
  );

  return (
    <form className={css.root} onSubmit={handleSubmit}>
      <BasicDayInWeekField
        form={form}
        values={values}
        disabledDates={disabledDates}
        title="Chọn ngày"
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
