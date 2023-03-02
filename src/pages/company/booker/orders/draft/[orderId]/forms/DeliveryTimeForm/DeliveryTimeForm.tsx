import Button from '@components/Button/Button';
import { FieldDatePickerComponent } from '@components/FormFields/FieldDatePicker/FieldDatePicker';
import { FieldSelectComponent } from '@components/FormFields/FieldSelect/FieldSelect';
import IconClock from '@components/Icons/IconClock/IconClock';
import { findMinStartDate } from '@helpers/orderHelper';
import { DateTime } from 'luxon';
import { useField, useForm } from 'react-final-form-hooks';
import { FormattedMessage, useIntl } from 'react-intl';

import css from './DeliveryTimeForm.module.scss';

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

type TDeliveryTimeFormProps = {
  onSubmit: (values: TDeliveryTimeFormValues) => void;
  initialValues?: TDeliveryTimeFormValues;
  loading?: boolean;
};

export type TDeliveryTimeFormValues = {
  deliveryHour: string;
};

const validate = (values: TDeliveryTimeFormValues) => {
  const errors: any = {};
  if (!values.deliveryHour) {
    errors.deliveryHour = 'Required';
  }
  return errors;
};

const DeliveryTimeForm: React.FC<TDeliveryTimeFormProps> = ({
  onSubmit,
  initialValues,
  loading,
}) => {
  const { form, handleSubmit, submitting, hasValidationErrors, pristine } =
    useForm<TDeliveryTimeFormValues>({
      onSubmit,
      validate,
      initialValues,
    });

  const intl = useIntl();

  const startDate = useField('startDate', form);
  const endDate = useField('endDate', form);
  const deliveryHour = useField('deliveryHour', form);
  const submitInprogress = loading || submitting;
  const disabledSubmit = pristine || submitInprogress || hasValidationErrors;

  const minStartDate = findMinStartDate();
  const selectedStartDate = startDate.input.value
    ? new Date(Number(startDate.input.value))
    : minStartDate;

  const selectedEndDate = DateTime.fromJSDate(selectedStartDate)
    .plus({ days: 1 })
    .toJSDate();
  const minEndDate = DateTime.fromJSDate(selectedStartDate)
    .plus({ days: 1 })
    .toJSDate();
  const maxEndDate = DateTime.fromJSDate(selectedStartDate)
    .plus({ days: 6 })
    .toJSDate();

  return (
    <form className={css.root} onSubmit={handleSubmit}>
      <FieldDatePickerComponent
        id="startDate"
        name="startDate"
        input={startDate.input}
        meta={startDate.meta}
        selected={selectedStartDate}
        label={intl.formatMessage({
          id: 'Booker.CreateOrder.Form.field.orderStartDate',
        })}
        minDate={minStartDate}
        dateFormat={'EEE, dd MMMM, yyyy'}
        placeholderText={intl.formatMessage({
          id: 'Booker.CreateOrder.Form.field.datePlaceholder',
        })}
        className={css.dateInput}
        autoComplete="off"
      />
      <FieldDatePickerComponent
        id="endDate"
        name="endDate"
        input={endDate.input}
        meta={endDate.meta}
        selected={selectedEndDate}
        label={intl.formatMessage({
          id: 'Booker.CreateOrder.Form.field.orderEndDate',
        })}
        minDate={minEndDate}
        maxDate={maxEndDate}
        dateFormat={'EEE, dd MMMM, yyyy'}
        placeholderText={intl.formatMessage({
          id: 'Booker.CreateOrder.Form.field.datePlaceholder',
        })}
        className={css.dateInput}
        autoComplete="off"
      />
      <FieldSelectComponent
        id="deliveryHour"
        name="deliveryHour"
        className={css.fieldSelect}
        label={intl.formatMessage({
          id: 'Booker.CreateOrder.Form.field.deliveryHour',
        })}
        leftIcon={<IconClock />}
        meta={deliveryHour.meta}
        input={deliveryHour.input}>
        {TIME_OPTIONS.map((option) => (
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

export default DeliveryTimeForm;
