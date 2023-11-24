import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import isEmpty from 'lodash/isEmpty';
import { DateTime } from 'luxon';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldDatePicker from '@components/FormFields/FieldDatePicker/FieldDatePicker';
import FieldDropdownSelect from '@components/FormFields/FieldDropdownSelect/FieldDropdownSelect';
import IconCalendar from '@components/Icons/IconCalender/IconCalender';
import IconClock from '@components/Icons/IconClock/IconClock';
import { useAppSelector } from '@hooks/reduxHooks';
import { TimeOptions } from '@utils/dates';

import css from './DeadlineDateTimeForm.module.scss';

export type DeadlineDateTimeFormValues = {
  deadlineDate: string | number;
  deadlineHour: string;
};

type TExtraProps = { deliveryTime: Date; shouldDisableSubmit?: boolean };
type DeadlineDateTimeFormComponentProps =
  FormRenderProps<DeadlineDateTimeFormValues> & Partial<TExtraProps>;
type DeadlineDateTimeFormProps = FormProps<DeadlineDateTimeFormValues> &
  TExtraProps;

const DeadlineDateTimeFormComponent: React.FC<
  DeadlineDateTimeFormComponentProps
> = (props) => {
  const {
    deliveryTime,
    shouldDisableSubmit = false,
    values,
    invalid,
    handleSubmit,
  } = props;
  const addOrderParticipantsInProgress = useAppSelector(
    (state) => state.BookerDraftOrderPage.addOrderParticipantsInProgress,
  );
  const bookerPublishOrderInProgress = useAppSelector(
    (state) => state.Order.publishOrderInProgress,
  );

  const {
    deadlineDate: deadlineDateFormFormValues,
    deadlineHour: deadlineHourFromFormValues,
  } = values;

  const selectedDeadlineDate = deadlineDateFormFormValues
    ? new Date(Number(deadlineDateFormFormValues))
    : DateTime.fromJSDate(new Date()).plus({ days: 2 }).toJSDate();
  const minDeadlineDate = DateTime.fromJSDate(new Date())
    .plus({ days: 1 })
    .toJSDate();
  const maxDeadlineDate = DateTime.fromJSDate(deliveryTime!)
    .minus({ days: 2 })
    .toJSDate();

  const anyActionsInProgress =
    bookerPublishOrderInProgress || addOrderParticipantsInProgress;
  const submitDisabled =
    anyActionsInProgress ||
    shouldDisableSubmit ||
    invalid ||
    isEmpty(deadlineHourFromFormValues);
  const submitInProgress = bookerPublishOrderInProgress;

  return (
    <Form className={css.formRoot} onSubmit={handleSubmit}>
      <div className={css.formContainer}>
        <div className={css.formTitle}>Thời hạn kết thúc chọn món</div>
        <FieldDatePicker
          id="DeadlineDateTimeForm.deadlineDate"
          name="deadlineDate"
          selected={selectedDeadlineDate}
          label="Chọn ngày hết hạn"
          minDate={minDeadlineDate}
          maxDate={maxDeadlineDate}
          dateFormat={'EEE, dd MMMM, yyyy'}
          placeholderText={'Ngày hết hạn'}
          className={css.dateInput}
          autoComplete="off"
          readOnly
          icon={<IconCalendar />}
        />
        <FieldDropdownSelect
          id="DeadlineDateTimeForm.deadlineHour"
          name="deadlineHour"
          placeholder="Giờ hết hạn"
          className={css.fieldSelect}
          label={'Chọn giờ hết hạn'}
          leftIcon={<IconClock />}
          options={TimeOptions}
        />
        <Button
          variant="cta"
          disabled={submitDisabled}
          inProgress={submitInProgress}>
          Gửi lời mời qua email
        </Button>
      </div>
    </Form>
  );
};

const DeadlineDateTimeForm: React.FC<DeadlineDateTimeFormProps> = (props) => {
  return <FinalForm {...props} component={DeadlineDateTimeFormComponent} />;
};

export default DeadlineDateTimeForm;
