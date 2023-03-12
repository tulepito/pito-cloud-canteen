import { useField, useForm } from 'react-final-form-hooks';
import { FormattedMessage, useIntl } from 'react-intl';
import { DateTime } from 'luxon';

import Button from '@components/Button/Button';
import { FieldDatePickerComponent } from '@components/FormFields/FieldDatePicker/FieldDatePicker';
import { FieldSelectComponent } from '@components/FormFields/FieldSelect/FieldSelect';
import IconClock from '@components/Icons/IconClock/IconClock';
import { TimeOptions } from '@utils/dates';

import css from './ExpiredTimeForm.module.scss';

type TExpiredTimeFormProps = {
  onSubmit: (values: TExpiredTimeFormValues) => void;
  initialValues?: TExpiredTimeFormValues;
  loading?: boolean;
  deliveryTime: Date;
};

export type TExpiredTimeFormValues = {
  deadlineDate: string | number;
  deadlineHour: string;
};

const validate = (values: TExpiredTimeFormValues) => {
  const errors: any = {};
  if (!values.deadlineDate) {
    errors.deadlineDate = 'Vui lòng chọn ngày cho hạn chọn món';
  }
  if (!values.deadlineHour) {
    errors.deadlineHour = 'Vui lòng chọn giờ cho hạn chọn món';
  }

  return errors;
};

const ExpiredTimeForm: React.FC<TExpiredTimeFormProps> = ({
  onSubmit,
  initialValues,
  loading,
  deliveryTime,
}) => {
  const { form, handleSubmit, submitting, hasValidationErrors, pristine } =
    useForm<TExpiredTimeFormValues>({
      onSubmit,
      validate,
      initialValues,
    });

  const intl = useIntl();

  const deadlineDate = useField('deadlineDate', form);
  const deadlineHour = useField('deadlineHour', form);
  const submitInprogress = loading || submitting;
  const disabledSubmit = pristine || submitInprogress || hasValidationErrors;

  const selectedDeadlineDate = deadlineDate.input.value
    ? new Date(Number(deadlineDate.input.value))
    : DateTime.fromMillis(Number(Date.now())).plus({ days: 2 }).toJSDate();
  const minDeadlineDate = DateTime.fromJSDate(new Date())
    .plus({ days: 1 })
    .toJSDate();
  const maxDeadlineDate = DateTime.fromJSDate(deliveryTime)
    .minus({ days: 2 })
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
        minDate={minDeadlineDate}
        maxDate={maxDeadlineDate}
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
        leftIcon={<IconClock />}
        meta={deadlineHour.meta}
        input={deadlineHour.input}>
        {TimeOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </FieldSelectComponent>
      <Button
        className={css.submitBtn}
        inProgress={submitInprogress}
        disabled={disabledSubmit}>
        <FormattedMessage id="Booker.CreateOrder.Form.saveChange" />
      </Button>
    </form>
  );
};

export default ExpiredTimeForm;
