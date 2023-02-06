import Button from '@components/Button/Button';
import { FieldDatePickerComponent } from '@components/FormFields/FieldDatePicker/FieldDatePicker';
import { FieldSelectComponent } from '@components/FormFields/FieldSelect/FieldSelect';
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
}) => {
  const { form, handleSubmit, submitting, hasValidationErrors } =
    useForm<TDeliveryTimeFormValues>({
      onSubmit,
      validate,
      initialValues,
    });

  const intl = useIntl();

  const orderStartDate = useField('orderStartDate', form);
  const orderEndDate = useField('orderEndDate', form);
  const deliveryHour = useField('deliveryHour', form);
  const disabledSubmit = submitting || hasValidationErrors;

  const selectedStartDate = orderStartDate.input.value
    ? new Date(Number(orderStartDate.input.value))
    : DateTime.fromMillis(Number(Date.now())).plus({ days: 2 }).toJSDate();
  const minStartDate = DateTime.fromJSDate(new Date())
    .plus({ days: 2 })
    .toJSDate();

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
        id="orderStartDate"
        name="orderStartDate"
        input={orderStartDate.input}
        meta={orderStartDate.meta}
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
        id="orderEndDate"
        name="orderEndDate"
        input={orderEndDate.input}
        meta={orderEndDate.meta}
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
        meta={deliveryHour.meta}
        input={deliveryHour.input}>
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

export default DeliveryTimeForm;
