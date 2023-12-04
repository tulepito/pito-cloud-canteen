import { useRef, useState } from 'react';
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
import RenderWhen from '@components/RenderWhen/RenderWhen';
import SlideModal from '@components/SlideModal/SlideModal';
import { convertHHmmStringToTimeParts } from '@helpers/dateHelpers';
import { useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useViewport } from '@hooks/useViewport';
import { TimeOptions } from '@utils/dates';

import MobileEditDeadlineDateField from './MobileEditDeadlineDateField';
import MobileEditDeadlineHourField from './MobileEditDeadlineHourField';

import css from './DeadlineDateTimeForm.module.scss';

export type TDeadlineDateTimeFormValues = {
  deadlineDate: string | number;
  deadlineHour: string;
  draftDeadlineHour?: string;
};

type TExtraProps = {
  deliveryTime: Date;
  shouldDisableSubmit?: boolean;
  onUpdateOrderInfo: (values: TDeadlineDateTimeFormValues) => void;
};
type DeadlineDateTimeFormComponentProps =
  FormRenderProps<TDeadlineDateTimeFormValues> & Partial<TExtraProps>;
type DeadlineDateTimeFormProps = FormProps<TDeadlineDateTimeFormValues> &
  TExtraProps;

const DeadlineDateTimeFormComponent: React.FC<
  DeadlineDateTimeFormComponentProps
> = (props) => {
  const {
    form,
    initialValues,
    deliveryTime,
    shouldDisableSubmit = false,
    values,
    invalid,
    handleSubmit,
    onUpdateOrderInfo,
  } = props;
  const formRef = useRef<any>(null);
  const mobileDeadlineModalControl = useBoolean();
  const { isMobileLayout } = useViewport();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const addOrderParticipantsInProgress = useAppSelector(
    (state) => state.BookerDraftOrderPage.addOrderParticipantsInProgress,
  );
  const bookerPublishOrderInProgress = useAppSelector(
    (state) => state.Order.publishOrderInProgress,
  );

  formRef.current = form;

  const {
    deadlineDate: deadlineDateFormFormValues,
    deadlineHour: deadlineHourFromFormValues,
    draftDeadlineHour,
  } = values;

  const selectedDeadlineDate = deadlineDateFormFormValues
    ? new Date(Number(deadlineDateFormFormValues))
    : null;
  const minDeadlineDate = DateTime.fromJSDate(new Date())
    .plus({ days: 1 })
    .toJSDate();
  const maxDeadlineDate = DateTime.fromJSDate(deliveryTime!)
    .minus({ days: 2 })
    .toJSDate();

  const isDeadlineHourEmpty = isEmpty(deadlineHourFromFormValues);
  const anyActionsInProgress =
    bookerPublishOrderInProgress || addOrderParticipantsInProgress;
  const submitDisabled =
    anyActionsInProgress ||
    shouldDisableSubmit ||
    invalid ||
    isDeadlineHourEmpty;
  const submitInProgress = bookerPublishOrderInProgress;
  const isAnyFieldsChanged =
    initialValues.deadlineHour !== deadlineHourFromFormValues ||
    initialValues.deadlineDate !== deadlineDateFormFormValues;
  const saveInfoButtonDisabled =
    !isAnyFieldsChanged || invalid || isDeadlineHourEmpty;

  const formattedDeadlineDate = deadlineDateFormFormValues
    ? DateTime.fromMillis(Number(deadlineDateFormFormValues))
        .startOf('day')
        .plus({ ...convertHHmmStringToTimeParts(deadlineHourFromFormValues) })
        .toFormat("HH:mm, dd 'tháng' MM, yyyy")
    : 'Vui lòng chọn thời hạn';

  const handleMobileModalClose = () => {
    mobileDeadlineModalControl.setFalse();

    if (isAnyFieldsChanged) {
      form.reset();
    }
  };

  const handleSubmitSelectedHour = () => {
    form.batch(() => {
      form.change('deadlineHour', draftDeadlineHour);
    });
  };

  const handleSubmitMobileChanges = () => {
    if (onUpdateOrderInfo) {
      onUpdateOrderInfo(values);
    }
    mobileDeadlineModalControl.setFalse();
  };

  const handleSubmitOutSideForm = () => {
    if (formRef.current) {
      (formRef.current as any).submit();
    }
  };

  const sendNotificationButton = (
    <Button
      variant="cta"
      disabled={submitDisabled}
      type="submit"
      onClick={handleSubmitOutSideForm}
      inProgress={submitInProgress}
      className={css.sendNotificationButton}>
      Gửi lời mời qua email
    </Button>
  );
  const saveInfoButton = (
    <Button
      type="button"
      disabled={saveInfoButtonDisabled}
      inProgress={submitInProgress}
      onClick={handleSubmitMobileChanges}>
      Lưu thay đổi
    </Button>
  );
  const formContentComponent = (
    <Form className={css.formRoot} onSubmit={handleSubmit}>
      <div className={css.formContainer}>
        <div className={css.formTitle}>Thời hạn kết thúc chọn món</div>
        <RenderWhen condition={isMobileLayout}>
          <MobileEditDeadlineDateField
            minDate={minDeadlineDate}
            maxDate={maxDeadlineDate}
            initialDeadlineDate={selectedDeadlineDate}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />

          <RenderWhen.False>
            <FieldDatePicker
              id="DeadlineDateTimeForm.deadlineDate"
              name="deadlineDate"
              selected={selectedDeadlineDate}
              label={isMobileLayout ? 'Ngày kết thúc' : 'Chọn ngày hết hạn'}
              placeholderText={
                isMobileLayout ? 'Chọn hạn chọn món' : 'Ngày hết hạn'
              }
              minDate={minDeadlineDate}
              maxDate={maxDeadlineDate}
              dateFormat={'EEE, dd MMMM, yyyy'}
              className={css.dateInput}
              autoComplete="off"
              readOnly
              icon={<IconCalendar />}
            />
          </RenderWhen.False>
        </RenderWhen>
        <RenderWhen condition={isMobileLayout}>
          <MobileEditDeadlineHourField
            initialDeadlineHour={deadlineHourFromFormValues}
            draftDeadlineHour={draftDeadlineHour}
            onSubmitSelectedHour={handleSubmitSelectedHour}
          />

          <RenderWhen.False>
            <FieldDropdownSelect
              id="DeadlineDateTimeForm.deadlineHour"
              name="deadlineHour"
              label={isMobileLayout ? 'Giờ kết thúc' : 'Chọn giờ hết hạn'}
              placeholder={isMobileLayout ? 'Chọn hạn chọn món' : 'Giờ hết hạn'}
              leftIcon={<IconClock />}
              options={TimeOptions}
            />
          </RenderWhen.False>
        </RenderWhen>
        {isMobileLayout ? saveInfoButton : sendNotificationButton}
      </div>
    </Form>
  );

  return (
    <RenderWhen condition={isMobileLayout}>
      <div>Thời hạn chọn món của thành viên</div>
      <div
        className={css.mobileDeadlineInfo}
        onClick={mobileDeadlineModalControl.setTrue}>
        <IconClock />
        <div className={deadlineDateFormFormValues ? '' : css.placeholder}>
          {formattedDeadlineDate}
        </div>
      </div>
      {sendNotificationButton}

      <SlideModal
        id="DeadlineDateTimeForm.mobileModal"
        modalTitle={'Thời hạn chọn món'}
        isOpen={mobileDeadlineModalControl.value}
        onClose={handleMobileModalClose}
        containerClassName={css.mobileModalContainer}>
        {formContentComponent}
      </SlideModal>

      <RenderWhen.False>{formContentComponent}</RenderWhen.False>
    </RenderWhen>
  );
};

const DeadlineDateTimeForm: React.FC<DeadlineDateTimeFormProps> = (props) => {
  return <FinalForm {...props} component={DeadlineDateTimeFormComponent} />;
};

export default DeadlineDateTimeForm;
