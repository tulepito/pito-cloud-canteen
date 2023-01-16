import FieldDatePicker from '@components/FieldDatePicker/FieldDatePicker';
import FieldSelect from '@components/FieldSelect/FieldSelect';
import { required } from '@utils/validators';
import classNames from 'classnames';
import subDays from 'date-fns/subDays';
import { useState } from 'react';
import { OnChange } from 'react-final-form-listeners';
import { useIntl } from 'react-intl';

import css from './OrderDeadlineField.module.scss';

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

type OrderDeadlineFieldProps = {
  form: any;
  values: Record<string, any>;
  columnLayout?: boolean;
  title?: string;
};

const OrderDeadlineField: React.FC<OrderDeadlineFieldProps> = (props) => {
  const { values, columnLayout, title, form } = props;
  const {
    deadlineDate: deadlineDateInitialValue,
    startDate: startDateInitialValue,
  } = values;
  const maxSelectedDate = startDateInitialValue
    ? subDays(startDateInitialValue, 2)
    : undefined;
  const intl = useIntl();
  const today = new Date();
  const initialDeadlineDate = deadlineDateInitialValue
    ? new Date(deadlineDateInitialValue)
    : null;
  const [dealineDate, setDeadlineDate] = useState<Date>(initialDeadlineDate!);
  const deadlineDateRequired = intl.formatMessage({
    id: 'OrderDeadlineField.deadlineDateRequired',
  });
  const deadlineHourRequired = intl.formatMessage({
    id: 'OrderDeadlineField.deadlineHourRequired',
  });

  const fieldGroupLayout = classNames(css.fieldGroups, {
    [css.column]: columnLayout,
  });
  const handleStartDateChange = (value: any, prevValue: any) => {
    if (deadlineDateInitialValue && value !== prevValue) {
      form.batch(() => {
        form.change('deadlineDate', undefined);
        setDeadlineDate(undefined!);
      });
    }
  };
  return (
    <div className={css.container}>
      {title && <div className={css.fieldTitle}>{title}</div>}
      <OnChange name="startDate">{handleStartDateChange}</OnChange>
      <div className={fieldGroupLayout}>
        <FieldDatePicker
          id="deadlineDate"
          name="deadlineDate"
          selected={dealineDate}
          onChange={(date: Date) => setDeadlineDate(date)}
          className={css.customInput}
          label={intl.formatMessage({
            id: 'OrderDeadlineField.deadlineDateLabel',
          })}
          placeholderText={intl.formatMessage({
            id: 'OrderDeadlineField.deadlineDatePlaceholder',
          })}
          autoComplete="off"
          minDate={today}
          maxDate={maxSelectedDate}
          dateFormat={'EEE, dd MMMM, yyyy'}
          validate={required(deadlineDateRequired)}
        />
        <FieldSelect
          id="deadlineHour"
          name="deadlineHour"
          label={intl.formatMessage({
            id: 'OrderDeadlineField.deliveryHourLabel',
          })}
          className={css.fieldSelect}
          validate={required(deadlineHourRequired)}>
          {TIME_OPTIONS.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </FieldSelect>
      </div>
    </div>
  );
};
export default OrderDeadlineField;
