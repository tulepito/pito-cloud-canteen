import FieldDatePicker from '@components/FormFields/FieldDatePicker/FieldDatePicker';
import FieldSelect from '@components/FormFields/FieldSelect/FieldSelect';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconCalendar from '@components/Icons/IconCalender/IconCalender';
import IconClock from '@components/Icons/IconClock/IconClock';
import { findValidRangeForDeadlineDate } from '@helpers/orderHelper';
import { generateTimeOptions } from '@utils/dates';
import type { TObject } from '@utils/types';
import { required } from '@utils/validators';
import classNames from 'classnames';
import format from 'date-fns/format';
import viLocale from 'date-fns/locale/vi';
import { forwardRef, useState } from 'react';
import { OnChange } from 'react-final-form-listeners';
import { useIntl } from 'react-intl';

import css from './OrderDeadlineField.module.scss';

const TIME_OPTIONS = generateTimeOptions();
type TOrderDeadlineFieldProps = {
  form: any;
  values: TObject;
  columnLayout?: boolean;
  title?: string;
};

// eslint-disable-next-line react/display-name
const CustomDeadlineFieldInput = forwardRef((props, ref) => {
  return (
    <FieldTextInput
      {...props}
      id="deadlineDate"
      name="deadlineDate"
      className={css.customInput}
      format={(value) => {
        return value
          ? format(new Date(value), 'EEE, dd MMMM, yyyy', {
              locale: viLocale,
            })
          : format(new Date(), 'EEE, dd MMMM, yyyy', {
              locale: viLocale,
            });
      }}
      leftIcon={<IconCalendar />}
      inputRef={ref}
    />
  );
});

const OrderDeadlineField: React.FC<TOrderDeadlineFieldProps> = (props) => {
  const { values, columnLayout, title, form } = props;
  const intl = useIntl();

  const {
    deadlineDate: deadlineDateInitialValue,
    startDate: startDateInitialValue,
  } = values;

  const { minSelectedDate, maxSelectedDate } = findValidRangeForDeadlineDate(
    startDateInitialValue,
  );

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

  const deadlineDateClasses = classNames(
    css.customInput,
    !dealineDate && css.placeholder,
  );
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
          className={deadlineDateClasses}
          label={intl.formatMessage({
            id: 'OrderDeadlineField.deadlineDateLabel',
          })}
          autoComplete="off"
          minDate={minSelectedDate}
          maxDate={maxSelectedDate}
          dateFormat={'EEE, dd MMMM, yyyy'}
          validate={required(deadlineDateRequired)}
          customInput={<CustomDeadlineFieldInput />}
        />
        <FieldSelect
          id="deadlineHour"
          name="deadlineHour"
          label={intl.formatMessage({
            id: 'OrderDeadlineField.deliveryHourLabel',
          })}
          className={css.fieldSelect}
          leftIcon={<IconClock />}
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
