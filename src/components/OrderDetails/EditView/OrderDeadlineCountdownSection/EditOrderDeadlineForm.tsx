import { useMemo } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import { addDays } from 'date-fns';
import { DateTime } from 'luxon';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldDatePicker from '@components/FormFields/FieldDatePicker/FieldDatePicker';
import FieldDropdownSelect from '@components/FormFields/FieldDropdownSelect/FieldDropdownSelect';
import IconCalendar from '@components/Icons/IconCalender/IconCalender';
import IconClock from '@components/Icons/IconClock/IconClock';
import { TimeOptions } from '@utils/dates';

import css from './EditOrderDeadlineForm.module.scss';

export type TEditOrderDeadlineFormValues = {
  deadlineDate: number;
  deadlineHour: string;
};

type TExtraProps = {
  startDate: number;
};
type TEditOrderDeadlineFormComponentProps =
  FormRenderProps<TEditOrderDeadlineFormValues> & Partial<TExtraProps>;
type TEditOrderDeadlineFormProps = FormProps<TEditOrderDeadlineFormValues> &
  TExtraProps;

const EditOrderDeadlineFormComponent: React.FC<
  TEditOrderDeadlineFormComponentProps
> = (props) => {
  const { handleSubmit, startDate, values, form, pristine } = props;
  const intl = useIntl();

  const today = new Date();
  const maxSelectedDate = DateTime.fromMillis(startDate!)
    .minus({ day: 2 })
    .toJSDate();
  const buttonDisabled = today.getTime() >= values.deadlineDate;
  const submitDisabled = pristine;

  const handleDeadlineDateChange = (date: number) => {
    form.change('deadlineDate', date);
  };

  const parsedDeliveryHourOptions = useMemo(
    () =>
      TimeOptions.map((option) => ({
        label: option.label,
        key: option.key,
      })),
    [],
  );

  return (
    <Form onSubmit={handleSubmit} className={css.root}>
      <div className={css.fieldDatePickerContainer}>
        <FieldDatePicker
          id="deadlineDate"
          name="deadlineDate"
          selected={values.deadlineDate}
          onChange={handleDeadlineDateChange}
          className={css.customInput}
          label={intl.formatMessage({
            id: 'EditOrderDeadlineForm.deadlineDate.label',
          })}
          autoComplete="off"
          minDate={addDays(today, 1)}
          maxDate={maxSelectedDate}
          dateFormat={'EEE, dd MMMM, yyyy'}
        />
        <IconCalendar className={css.calendarIcon} />
      </div>
      <FieldDropdownSelect
        id="deadlineHour"
        name="deadlineHour"
        label={intl.formatMessage({
          id: 'EditOrderDeadlineForm.deadlineHour.label',
        })}
        className={css.fieldSelect}
        dropdownWrapperClassName={css.dropdownWrapper}
        leftIcon={<IconClock className={css.clockIcon} />}
        options={parsedDeliveryHourOptions}
      />

      <div className={css.actions}>
        <Button disabled={submitDisabled || buttonDisabled}>
          {intl.formatMessage({ id: 'EditOrderDeadlineForm.submitButtonText' })}
        </Button>
      </div>
    </Form>
  );
};

const EditOrderDeadlineForm: React.FC<TEditOrderDeadlineFormProps> = (
  props,
) => {
  return <FinalForm {...props} component={EditOrderDeadlineFormComponent} />;
};

export default EditOrderDeadlineForm;
