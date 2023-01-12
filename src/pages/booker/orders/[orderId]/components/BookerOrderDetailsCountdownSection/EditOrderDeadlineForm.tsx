import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldDatePicker from '@components/FormFields/FieldDatePicker/FieldDatePicker';
import FieldSelect from '@components/FormFields/FieldSelect/FieldSelect';
import IconCalendar from '@components/Icons/IconCalender/IconCalender';
import IconClock from '@components/Icons/IconClock/IconClock';
import config from '@src/configs';
import { DateTime } from 'luxon';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import css from './EditOrderDeadlineForm.module.scss';

export type TEditOrderDeadlineFormValues = {
  deadlineDate: Date;
  deadlineHour: string;
};

type TExtraProps = {
  startDate: Date;
};
type TEditOrderDeadlineFormComponentProps =
  FormRenderProps<TEditOrderDeadlineFormValues> & Partial<TExtraProps>;
type TEditOrderDeadlineFormProps = FormProps<TEditOrderDeadlineFormValues> &
  TExtraProps;

const EditOrderDeadlineFormComponent: React.FC<
  TEditOrderDeadlineFormComponentProps
> = (props) => {
  const intl = useIntl();
  const { handleSubmit, startDate, values } = props;
  const today = new Date();
  const maxSelectedDate = DateTime.fromJSDate(startDate!)
    .minus({ day: 2 })
    .toJSDate();

  return (
    <Form onSubmit={handleSubmit} className={css.root}>
      <div className={css.fieldDatePickerContainer}>
        <FieldDatePicker
          id="deadlineDate"
          name="deadlineDate"
          selected={values.deadlineDate}
          // onChange={(date: Date) => setDeadlineDate(date)}
          className={css.customInput}
          label={intl.formatMessage({
            id: 'EditOrderDeadlineForm.deadlineDate.label',
          })}
          autoComplete="off"
          minDate={today}
          maxDate={maxSelectedDate}
          dateFormat={'EEE, dd MMMM, yyyy'}
        />
        <IconCalendar className={css.calendarIcon} />
      </div>
      <FieldSelect
        id="deadlineHour"
        name="deadlineHour"
        label={intl.formatMessage({
          id: 'EditOrderDeadlineForm.deadlineHour.label',
        })}
        className={css.fieldSelect}
        leftIcon={<IconClock className={css.clockIcon} />}>
        {config.deadlineTimeOptions.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </FieldSelect>
      <div className={css.actions}>
        <Button>
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
