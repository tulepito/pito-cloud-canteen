import FieldDatePicker from '@components/FieldDatePicker/FieldDatePicker';
import FieldSelect from '@components/FieldSelect/FieldSelect';
import { required } from '@utils/validators';
import classNames from 'classnames';
import subDays from 'date-fns/subDays';
import { useState } from 'react';
import { useIntl } from 'react-intl';

import css from './OrderDealineField.module.scss';

const TIME_OPTIONS = [
  '7:00',
  '8:00',
  '9:00',
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

type OrderDealineFieldProps = {
  form: any;
  values: Record<string, any>;
  columnLayout?: boolean;
  title?: string;
};

const OrderDealineField: React.FC<OrderDealineFieldProps> = (props) => {
  const { values, columnLayout, title } = props;
  const {
    deadlineDate: deadlineDateInitialValue,
    startDate: startDateInitialValue,
  } = values;
  const maxSelectedDate = subDays(startDateInitialValue, 2);
  const intl = useIntl();
  const today = new Date();
  const initialDeadlineDate = deadlineDateInitialValue
    ? new Date(deadlineDateInitialValue)
    : null;
  const [dealineDate, setDeadlineDate] = useState<Date>(initialDeadlineDate!);
  const deadlineDateRequired = intl.formatMessage({
    id: 'OrderDealineField.deadlineDateRequired',
  });
  const deadlineHourRequired = intl.formatMessage({
    id: 'OrderDealineField.deadlineHourRequired',
  });

  const fieldGroupLayout = classNames(css.fieldGroups, {
    [css.column]: columnLayout,
  });
  return (
    <div className={css.container}>
      {title && <div className={css.fieldTitle}>{title}</div>}

      <div className={fieldGroupLayout}>
        <FieldDatePicker
          id="deadlineDate"
          name="deadlineDate"
          selected={dealineDate}
          onChange={(date: Date) => setDeadlineDate(date)}
          className={css.customInput}
          label={intl.formatMessage({
            id: 'OrderDealineField.deadlineDateLabel',
          })}
          minDate={today}
          maxDate={maxSelectedDate}
          dateFormat={'EEE, dd MMMM, yyyy'}
          validate={required(deadlineDateRequired)}
        />
        <FieldSelect
          id="deadlineHour"
          name="deadlineHour"
          label={intl.formatMessage({
            id: 'OrderDealineField.deliveryHourLabel',
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
export default OrderDealineField;
