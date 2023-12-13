import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import { FormattedMessage, useIntl } from 'react-intl';
import { DateTime } from 'luxon';

import Button from '@components/Button/Button';
import { FieldDatePickerComponent } from '@components/FormFields/FieldDatePicker/FieldDatePicker';
import { FieldDropdownSelectComponent } from '@components/FormFields/FieldDropdownSelect/FieldDropdownSelect';
import IconClock from '@components/Icons/IconClock/IconClock';
import { findMinStartDate } from '@helpers/orderHelper';
import { TimeRangeItems } from '@utils/dates';

import css from './DeliveryTimeForm.module.scss';

type TDeliveryTimeFormProps = {
  onSubmit: (values: TDeliveryTimeFormValues) => void;
  initialValues?: TDeliveryTimeFormValues;
  loading?: boolean;
  onCustomStartDateChange?: (date: number) => void;
};

export type TDeliveryTimeFormValues = {
  deliveryHour: string;
  startDate: number;
  endDate: number;
};

const validate = (values: TDeliveryTimeFormValues) => {
  const errors: any = {};
  const { startDate } = values;
  if (startDate && startDate < new Date().getTime()) {
    errors.startDate = 'Thời điểm hiện tại vượt quá thời gian giao hàng';
  }

  if (!values.deliveryHour) {
    errors.deliveryHour = 'Vui lòng chọn giờ giao hàng';
  }

  if (!values.endDate) {
    errors.endDate = 'Vui lòng chọn ngày kết thúc';
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

  const { endDate: endDateInitialValue } = initialValues || {};
  const startDateValueRef = useRef<number>();
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

  const minEndDate = DateTime.fromJSDate(selectedStartDate)
    .plus({ days: 1 })
    .toJSDate();
  const maxEndDate = DateTime.fromJSDate(selectedStartDate)
    .plus({ days: 6 })
    .toJSDate();

  const handleStartDateChange = useCallback(
    (value: any, prevValue: any) => {
      if (endDateInitialValue && value !== prevValue) {
        form.batch(() => {
          form.change('endDate', undefined);
        });
      }
      startDateValueRef.current = startDate.input.value;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [endDateInitialValue, startDate.input.value],
  );

  useEffect(() => {
    if (!form.getFieldState('startDate')?.pristine) {
      handleStartDateChange(startDate.input.value, startDateValueRef?.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.getFieldState('startDate')?.pristine, startDate.input.value]);

  const parsedDeliveryHourOptions = useMemo(
    () =>
      TimeRangeItems.map((option) => ({
        label: option.label,
        key: option.key,
      })),
    [],
  );

  return (
    <form className={css.root} onSubmit={handleSubmit}>
      <div>
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
        <FieldDropdownSelectComponent
          id="deliveryHour"
          name="deliveryHour"
          className={css.fieldSelect}
          label={intl.formatMessage({
            id: 'Booker.CreateOrder.Form.field.deliveryHour',
          })}
          leftIcon={<IconClock />}
          meta={deliveryHour.meta}
          input={deliveryHour.input}
          options={parsedDeliveryHourOptions}
        />
      </div>
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
