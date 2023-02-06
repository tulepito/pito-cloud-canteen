import Button from '@components/Button/Button';
import { FieldDatePickerComponent } from '@components/FormFields/FieldDatePicker/FieldDatePicker';
import { FieldSelectComponent } from '@components/FormFields/FieldSelect/FieldSelect';
import { DateTime } from 'luxon';
import { useField, useForm } from 'react-final-form-hooks';
import { FormattedMessage, useIntl } from 'react-intl';

import css from './ExpiredTimeForm.module.scss';

const TIME_OPTIONS = [
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
];

type TExpiredTimeFormProps = {
  onSubmit: (values: TExpiredTimeFormValues) => void;
  initialValues?: TExpiredTimeFormValues;
};

export type TExpiredTimeFormValues = {
  deadlineDate: string;
  deadlineHour: string;
};

const validate = (values: TExpiredTimeFormValues) => {
  const errors: any = {};
  if (!values.deadlineDate) {
    errors.deadlineDate = 'Required';
  }
  if (!values.deadlineHour) {
    errors.deadlineHour = 'Required';
  }
  return errors;
};

const ExpiredTimeForm: React.FC<TExpiredTimeFormProps> = ({
  onSubmit,
  initialValues,
}) => {
  const { form, handleSubmit, submitting, hasValidationErrors } =
    useForm<TExpiredTimeFormValues>({
      onSubmit,
      validate,
      initialValues,
    });

  const intl = useIntl();

  const deadlineDate = useField('deadlineDate', form);
  const deadlineHour = useField('deadlineHour', form);
  const disabledSubmit = submitting || hasValidationErrors;

  const selectedDeadlineDate = deadlineDate.input.value
    ? new Date(Number(deadlineDate.input.value))
    : DateTime.fromMillis(Number(Date.now())).plus({ days: 2 }).toJSDate();
  const minStartDate = DateTime.fromJSDate(new Date())
    .plus({ days: 2 })
    .toJSDate();

  return (
    <form className={css.root} onSubmit={handleSubmit}>
      <FieldDatePickerComponent
        id="deadlineDate"
        name="deadlineDate"
        input={deadlineDate.input}
        meta={deadlineDate.meta}
        selected={selectedDeadlineDate}
        label={intl.formatMessage({
          id: 'Booker.CreateOrder.Form.field.deadlineDate',
        })}
        minDate={minStartDate}
        dateFormat={'EEE, dd MMMM, yyyy'}
        placeholderText={intl.formatMessage({
          id: 'Booker.CreateOrder.Form.field.datePlaceholder',
        })}
        className={css.dateInput}
        autoComplete="off"
      />
      <FieldSelectComponent
        id="deadlineHour"
        name="deadlineHour"
        className={css.fieldSelect}
        label={intl.formatMessage({
          id: 'Booker.CreateOrder.Form.field.deadlineHour',
        })}
        meta={deadlineHour.meta}
        input={deadlineHour.input}>
        {TIME_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </FieldSelectComponent>
      <Button className={css.submitBtn} disabled={disabledSubmit}>
        <FormattedMessage id="Booker.CreateOrder.Form.saveChange" />
      </Button>
    </form>
  );
};

export default ExpiredTimeForm;
