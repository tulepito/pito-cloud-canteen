import { useRef, useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
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
import { findDeliveryDate } from '@helpers/order/prepareDataHelper';
import { useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useViewport } from '@hooks/useViewport';
import { generateTimeRangeItems } from '@utils/dates';

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
  deliveryHour: string;
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
    deliveryHour,
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

  const newDeliveryDate = new Date(
    findDeliveryDate(deliveryTime?.getTime(), deliveryHour) ?? 0,
  );

  const currentDate = DateTime.fromJSDate(new Date());
  const deliveryDate = DateTime.fromJSDate(newDeliveryDate!);

  const minDeadlineDate = currentDate.toJSDate();
  const maxDeadlineDate = deliveryDate
    .minus({
      hours: +process.env.NEXT_PUBLIC_PARTICIPANT_MINIMUM_SELECTION_TIME,
    })
    .toJSDate();

  const isDeadlineHourEmpty = isEmpty(deadlineHourFromFormValues);

  const anyActionsInProgress =
    bookerPublishOrderInProgress || addOrderParticipantsInProgress;

  const submitDisabled =
    anyActionsInProgress ||
    shouldDisableSubmit ||
    invalid ||
    isDeadlineHourEmpty ||
    !selectedDeadlineDate;

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

  const intl = useIntl();

  const sendNotificationButton = (
    <Button
      variant="primary"
      disabled={submitDisabled}
      type="submit"
      onClick={handleSubmitOutSideForm}
      inProgress={submitInProgress}
      className={css.sendNotificationButton}>
      {intl.formatMessage({ id: 'gui-loi-moi-qua-email' })}
    </Button>
  );
  const saveInfoButton = (
    <Button
      type="button"
      disabled={saveInfoButtonDisabled}
      inProgress={submitInProgress}
      onClick={handleSubmitMobileChanges}>
      {intl.formatMessage({ id: 'AddOrderForm.moibleSubmitButtonText' })}
    </Button>
  );

  const filterTimeOptions = (
    selectedDeadlineDateP: Date | null,
    maxDeadlineDateP: Date,
  ) => {
    const timeRangeItems = generateTimeRangeItems({});
    const currentTime = new Date();

    const isToday =
      selectedDeadlineDateP?.toDateString() === currentTime.toDateString();

    return timeRangeItems.filter((option) => {
      const [hour, minute] = option.key.split(':');

      if (!selectedDeadlineDateP) return false;

      const optionTime = new Date(selectedDeadlineDateP);
      optionTime.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0);

      if (isToday) {
        return (
          optionTime.getTime() > currentTime.getTime() &&
          optionTime.getTime() <= maxDeadlineDateP.getTime()
        );
      }

      return optionTime.getTime() <= maxDeadlineDateP.getTime();
    });
  };

  const filteredTimeOptions = filterTimeOptions(
    selectedDeadlineDate,
    maxDeadlineDate,
  );

  const formContentComponent = (
    <Form
      className={css.formRoot}
      style={{ position: 'relative' }}
      onSubmit={handleSubmit}>
      <div
        style={
          isMobileLayout
            ? {
                display: 'none',
              }
            : {
                position: 'absolute',
                top: '-80px',
                width: 'fit-content',
                right: 0,
              }
        }>
        {sendNotificationButton}
      </div>
      <div className={css.formContainer}>
        <div className={css.formTitle}>
          {intl.formatMessage({ id: 'thoi-han-ket-thuc-chon-mon' })}
        </div>
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
              label={
                isMobileLayout
                  ? intl.formatMessage({ id: 'ngay-ket-thuc' })
                  : intl.formatMessage({ id: 'chon-ngay-het-han' })
              }
              placeholderText={
                isMobileLayout
                  ? intl.formatMessage({ id: 'chon-han-chon-mon' })
                  : intl.formatMessage({ id: 'ngay-het-han' })
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
              label={
                isMobileLayout
                  ? intl.formatMessage({ id: 'gio-ket-thuc' })
                  : intl.formatMessage({ id: 'chon-gio-het-han' })
              }
              placeholder={
                isMobileLayout
                  ? intl.formatMessage({ id: 'chon-han-chon-mon' })
                  : intl.formatMessage({ id: 'gio-het-han' })
              }
              leftIcon={<IconClock />}
              disabled={!selectedDeadlineDate}
              options={filteredTimeOptions}
            />
          </RenderWhen.False>
        </RenderWhen>
        {isMobileLayout ? saveInfoButton : null}
      </div>
    </Form>
  );

  return (
    <RenderWhen condition={isMobileLayout}>
      <div>
        {intl.formatMessage({ id: 'thoi-han-chon-mon-cua-thanh-vien' })}
      </div>
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
        modalTitle={intl.formatMessage({ id: 'thoi-han-chon-mon' })}
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
