import FieldDatePicker from '@components/FieldDatePicker/FieldDatePicker';
import FieldSelect from '@components/FieldSelect/FieldSelect';
import { required } from '@utils/validators';
import addDays from 'date-fns/addDays';
import { useState } from 'react';
import { useIntl } from 'react-intl';

import css from './MealPlanDateField.module.scss';

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
const MealPlanDateField = () => {
  const intl = useIntl();
  const today = new Date();
  const initialStartDate = addDays(today, 2);
  const [startDate, setStartDate] = useState<Date>(initialStartDate);
  const [endDate, setEndDate] = useState<Date>();
  const startDateRequiredMessage = intl.formatMessage({
    id: 'MealPlanDateField.startDateRequired',
  });
  const endDateRequiredMessage = intl.formatMessage({
    id: 'MealPlanDateField.endDateRequired',
  });
  const deliveryHourRequiredMessage = intl.formatMessage({
    id: 'MealPlanDateField.deliveryHourRequired',
  });
  return (
    <div className={css.container}>
      <div className={css.fieldTitle}>
        {intl.formatMessage({ id: 'MealPlanDateField.title' })}
      </div>
      <div className={css.fieldGroups}>
        <FieldDatePicker
          id="startDate"
          name="startDate"
          selected={startDate}
          onChange={(date: Date) => setStartDate(date)}
          className={css.customInput}
          label={intl.formatMessage({ id: 'MealPlanDateField.startDateLabel' })}
          minDate={initialStartDate}
          dateFormat={'EEE, dd MMMM, yyyy'}
          validate={required(startDateRequiredMessage)}
        />
        <FieldDatePicker
          id="endDate"
          name="endDate"
          onChange={(date: Date) => setEndDate(date)}
          selected={endDate}
          label={intl.formatMessage({ id: 'MealPlanDateField.endDateLabel' })}
          className={css.customInput}
          minDate={startDate}
          dateFormat={'EEE, dd MMMM, yyyy'}
          validate={required(endDateRequiredMessage)}
        />
        <FieldSelect
          id="deliveryHour"
          name="deliveryHour"
          label={intl.formatMessage({
            id: 'MealPlanDateField.deliveryHourLabel',
          })}
          className={css.fieldSelect}
          validate={required(deliveryHourRequiredMessage)}>
          {TIME_OPTIONS.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </FieldSelect>
      </div>
    </div>
  );
};
export default MealPlanDateField;
