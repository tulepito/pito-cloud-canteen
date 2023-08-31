/* eslint-disable @typescript-eslint/no-shadow */
import { useEffect, useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Field, Form as FinalForm } from 'react-final-form';
import { OnChange } from 'react-final-form-listeners';
import { DateTime } from 'luxon';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldDateRangePicker from '@components/FormFields/FieldDateRangePicker/FieldDateRangePicker';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconCalendar from '@components/Icons/IconCalender/IconCalender';
import IconDanger from '@components/Icons/IconDanger/IconDanger';
import LoadingModal from '@components/LoadingModal/LoadingModal';
import AlertModal from '@components/Modal/AlertModal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import SlideModal from '@components/SlideModal/SlideModal';
import Toggle from '@components/Toggle/Toggle';
import Tooltip from '@components/Tooltip/Tooltip';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useViewport } from '@hooks/useViewport';
import { Listing, Transaction } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';

import { PartnerSettingsThunks } from '../../PartnerSettings.slice';

import InProgressOrdersModal from './InProgressOrderModal';

import css from './RestaurantSettingForm.module.scss';

export type TRestaurantSettingFormValues = {
  stopReceiveOrder: boolean;
  startStopReceiveOrderDate: number;
  endStopReceiveOrderDate: number;
  startDayOff: number;
  endDayOff: number;
  isActive: boolean;
};

type TExtraProps = {
  inProgress?: boolean;
  disabledSubmitOnDesktopFlow?: boolean;
  setFormValues?: (values: TRestaurantSettingFormValues) => void;
};
type TRestaurantSettingFormComponentProps =
  FormRenderProps<TRestaurantSettingFormValues> & Partial<TExtraProps>;
type TRestaurantSettingFormProps = FormProps<TRestaurantSettingFormValues> &
  TExtraProps;

const RestaurantSettingFormComponent: React.FC<
  TRestaurantSettingFormComponentProps
> = (props) => {
  const {
    handleSubmit,
    inProgress = false,
    disabledSubmitOnDesktopFlow = false,
    values,
    initialValues,
    setFormValues,
  } = props;
  const { isMobileLayout } = useViewport();
  const dispatch = useAppDispatch();
  const stopReceiveOrderControl = useBoolean();
  const dayOffControl = useBoolean();
  const cannotTurnOffAppStatusControl = useBoolean();
  const cannotUpdateDayOffRangeControl = useBoolean();
  const inProgressOrdersModalControl = useBoolean();
  const paymentPartnerRecords = useAppSelector(
    (state) => state.PartnerManagePayments.paymentPartnerRecords,
  );
  const toggleAppStatusInProgress = useAppSelector(
    (state) => state.PartnerSettingsPage.toggleAppStatusInProgress,
  );
  const inProgressTransactions = useAppSelector(
    (state) => state.PartnerSettingsPage.inProgressTransactions,
  );
  const restaurantListing = useAppSelector(
    (state) => state.PartnerSettingsPage.restaurantListing,
  );
  const today = new Date();

  const [currentOrders, setCurrentOrders] = useState<any>([]);
  const [stopReceiveOrderRange, setStopReceiveOrderRange] = useState<any>({
    startDate: initialValues.startStopReceiveOrderDate
      ? new Date(initialValues.startStopReceiveOrderDate)
      : today,
    endDate: initialValues.endStopReceiveOrderDate
      ? new Date(initialValues.endStopReceiveOrderDate)
      : today,
  });
  const [dayOffRange, setDayOffRange] = useState<any>({
    startDate: initialValues.startDayOff
      ? new Date(initialValues.startDayOff)
      : today,
    endDate: initialValues.endDayOff
      ? new Date(initialValues.endDayOff)
      : today,
  });

  useEffect(
    () =>
      setStopReceiveOrderRange({
        startDate: initialValues.startStopReceiveOrderDate,
        endDate: initialValues.endStopReceiveOrderDate,
      }),
    [
      initialValues.startStopReceiveOrderDate,
      initialValues.endStopReceiveOrderDate,
    ],
  );

  useEffect(
    () =>
      setDayOffRange({
        startDate: initialValues.startDayOff,
        endDate: initialValues.endDayOff,
      }),
    [initialValues.startDayOff, initialValues.endDayOff],
  );

  const { isActive = true } = Listing(restaurantListing).getPublicData();

  const handleChangeStopReceiveOrder = (value: boolean) => {
    if (isMobileLayout && !value) {
      dispatch(
        PartnerSettingsThunks.updatePartnerRestaurantListing({
          stopReceiveOrder: value,
        }),
      );
    } else if (setFormValues) {
      setFormValues({ ...values, stopReceiveOrder: value });
    }
  };

  const isUpdateStopReceiveOrderRangeDisabled =
    stopReceiveOrderRange.startDate === null ||
    stopReceiveOrderRange.endDate === null ||
    stopReceiveOrderRange.startDate > stopReceiveOrderRange.endDate;
  const handleUpdateStopReceiveOrderRangeClick = () => {
    stopReceiveOrderControl.setFalse();
    const newValues = {
      startStopReceiveOrderDate: stopReceiveOrderRange.startDate.getTime(),
      endStopReceiveOrderDate: stopReceiveOrderRange.endDate.getTime(),
      stopReceiveOrder: true,
    };

    if (isMobileLayout) {
      dispatch(
        PartnerSettingsThunks.updatePartnerRestaurantListing({
          ...newValues,
        }),
      );
    } else if (setFormValues) {
      setFormValues({
        ...values,
        ...newValues,
      });
    }
  };

  const stopReceiveOrderDatePicker = (
    <>
      <FieldDateRangePicker
        id="RestaurantSettingForm.stopReceiveOrderRange"
        name="stopReceiveOrderRange"
        minDate={today}
        selected={stopReceiveOrderRange.startDate}
        onChange={(values: [Date | null, Date | null]) => {
          setStopReceiveOrderRange({
            startDate: values[0],
            endDate: values[1],
          });
        }}
        startDate={stopReceiveOrderRange.startDate}
        endDate={stopReceiveOrderRange.endDate}
      />
      <div className={css.slideModalActions}>
        <Button variant="inline" onClick={stopReceiveOrderControl.setFalse}>
          Hủy
        </Button>
        <Button
          disabled={isUpdateStopReceiveOrderRangeDisabled}
          onClick={handleUpdateStopReceiveOrderRangeClick}>
          Áp dụng
        </Button>
      </div>
    </>
  );

  // #region Toggle App status
  const inProgressTransactionsAfterToDay = inProgressTransactions
    .reduce((txList: any[], tx: any) => {
      const endTime = tx?.booking?.attributes?.displayEnd;
      const startTime = tx?.booking?.attributes?.displayStart;
      const { orderId } = Transaction(tx).getMetadata();
      const timestamp = DateTime.fromJSDate(startTime)
        .startOf('day')
        .toMillis();
      const validPaymentRecord =
        paymentPartnerRecords[orderId] &&
        paymentPartnerRecords[orderId][timestamp] &&
        paymentPartnerRecords[orderId][timestamp][0];

      return validPaymentRecord && endTime > today
        ? txList.concat({ time: startTime, paymentRecord: validPaymentRecord })
        : txList;
    }, [])
    .sort((a: any, b: any) => a.time.getTime() - b.time.getTime()) as any[];

  const inProgressTransactionsAfterToDayCount =
    inProgressTransactionsAfterToDay.length;
  const nearestNextDateHaveInProgressOrder =
    inProgressTransactionsAfterToDayCount > 0
      ? inProgressTransactionsAfterToDay[0].time
      : new Date();
  const theBestFarNextDateHaveInProgressOrder =
    inProgressTransactionsAfterToDayCount > 1
      ? inProgressTransactionsAfterToDay[
          inProgressTransactionsAfterToDayCount - 1
        ].time
      : nearestNextDateHaveInProgressOrder;

  const isEnableTurnOffAppStatus =
    !isActive || (isActive && inProgressTransactionsAfterToDayCount === 0);
  const isToggleAppStatusDisabled = toggleAppStatusInProgress;

  const handleToggleStatusClick = () => {
    if (isEnableTurnOffAppStatus) {
      if (isMobileLayout) {
        dispatch(PartnerSettingsThunks.toggleRestaurantActiveStatus());
      } else if (setFormValues) {
        setFormValues(values);
      }
    } else {
      cannotTurnOffAppStatusControl.setTrue();
    }
  };
  // #endregion

  // #region Day off
  const inProgressTransactionsInDayOffRange = inProgressTransactions
    .reduce((txList: any[], tx: any) => {
      const { startDate, endDate } = dayOffRange;
      const booking = tx?.booking || {};
      const { orderId } = Transaction(tx).getMetadata();
      const bookingEndTime = booking?.attributes?.displayEnd;
      const bookingStartTime = booking?.attributes?.displayStart;
      const timestamp = DateTime.fromJSDate(bookingStartTime)
        .startOf('day')
        .toMillis();

      const validBooking =
        (startDate instanceof Date ? startDate : today) <= bookingStartTime &&
        bookingEndTime <= (endDate instanceof Date ? endDate : today);
      const validPaymentRecord =
        paymentPartnerRecords[orderId] &&
        paymentPartnerRecords[orderId][timestamp] &&
        paymentPartnerRecords[orderId][timestamp][0];

      return validPaymentRecord && validBooking
        ? txList.concat({ time: timestamp, paymentRecord: validPaymentRecord })
        : txList;
    }, [])
    .sort((a: any, b: any) => a.time.getTime() - b.time.getTime());

  const inProgressTransactionsInDayOffRangeCount =
    inProgressTransactionsInDayOffRange.length;
  const nearestNextDateHaveInProgressOrderForDayOff =
    inProgressTransactionsInDayOffRangeCount > 0
      ? inProgressTransactionsInDayOffRange[0].time
      : new Date();
  const theBestFarNextDateHaveInProgressOrderForDayOff =
    inProgressTransactionsInDayOffRangeCount > 1
      ? inProgressTransactionsInDayOffRange[
          inProgressTransactionsInDayOffRangeCount - 1
        ].time
      : nearestNextDateHaveInProgressOrderForDayOff;

  const isEnableUpdateDateOffRangeAppStatus =
    inProgressTransactionsInDayOffRangeCount === 0;

  const isUpdateDayOffRangeDisabled =
    dayOffRange.startDate === null ||
    dayOffRange.endDate === null ||
    dayOffRange.startDate > dayOffRange.endDate;

  const handleUpdateDayOffRangeClick = () => {
    const newValues = {
      startDayOff: dayOffRange.startDate.getTime(),
      endDayOff: dayOffRange.endDate.getTime(),
    };

    if (isEnableUpdateDateOffRangeAppStatus) {
      dayOffControl.setFalse();
      if (isMobileLayout) {
        dispatch(
          PartnerSettingsThunks.updatePartnerRestaurantListing({
            ...newValues,
          }),
        );
      } else if (setFormValues) {
        setFormValues({
          ...values,
          ...newValues,
        });
      }
    } else {
      dayOffControl.setFalse();
      cannotUpdateDayOffRangeControl.setTrue();
    }
  };

  const dayOffDatePicker = (
    <>
      <FieldDateRangePicker
        id="RestaurantSettingForm.dayOff"
        name="dayOffRange"
        selected={dayOffRange.startDate}
        minDate={today}
        onChange={(values: [Date | null, Date | null]) => {
          setDayOffRange({
            startDate: values[0],
            endDate: values[1],
          });
        }}
        startDate={dayOffRange.startDate}
        endDate={dayOffRange.endDate}
      />
      <div className={css.slideModalActions}>
        <Button variant="inline" onClick={dayOffControl.setFalse}>
          Hủy
        </Button>
        <Button
          disabled={isUpdateDayOffRangeDisabled}
          onClick={handleUpdateDayOffRangeClick}>
          Áp dụng
        </Button>
      </div>
    </>
  );

  const handleViewOrdersForDayOff = () => {
    setCurrentOrders(inProgressTransactionsInDayOffRange);
    inProgressOrdersModalControl.setTrue();
    cannotUpdateDayOffRangeControl.setFalse();
  };
  const handleViewOrdersForTurnOffApp = () => {
    setCurrentOrders(inProgressTransactionsAfterToDay);
    cannotTurnOffAppStatusControl.setFalse();
    inProgressOrdersModalControl.setTrue();
  };
  // #endregion Day off

  return (
    <Form onSubmit={handleSubmit} className={css.formRoot}>
      <div className={css.header}>Cài đặt</div>
      <div className={css.subHeader}>Cài đặt nhà hàng</div>

      <div className={css.fieldContainer}>
        <Field
          id="RestaurantSettingForm.stopReceiveOrder"
          name="stopReceiveOrder">
          {(props) => {
            const { id, input } = props;

            return (
              <Toggle
                label={'Ngưng nhận đơn'}
                id={id}
                name={input.name}
                status={input.value ? 'on' : 'off'}
                onClick={(value) => {
                  input.onChange(value);
                }}
                disabled={inProgress}
                className={css.stopReceiveOrderToggle}
              />
            );
          }}
        </Field>
        <OnChange name="stopReceiveOrder">
          {handleChangeStopReceiveOrder}
        </OnChange>

        <RenderWhen condition={isMobileLayout}>
          <FieldTextInput
            id="RestaurantSettingForm.stopReceiveOrderInfo"
            name="stopReceiveOrderInfo"
            leftIcon={<IconCalendar />}
            onClick={stopReceiveOrderControl.setTrue}
            disabled={!values.stopReceiveOrder || inProgress}
            onChange={() => {}}
          />
          <RenderWhen.False>
            <Tooltip
              overlayClassName={css.datePickerTooltip}
              overlayInnerStyle={{ backgroundColor: '#ffffff' }}
              showArrow={false}
              tooltipContent={stopReceiveOrderDatePicker}
              visible={!isMobileLayout && stopReceiveOrderControl.value}
              trigger="click"
              placement="bottomLeft">
              <FieldTextInput
                id="RestaurantSettingForm.stopReceiveOrderInfo"
                name="stopReceiveOrderInfo"
                leftIcon={<IconCalendar />}
                onClick={stopReceiveOrderControl.setTrue}
                disabled={!values.stopReceiveOrder || inProgress}
                onChange={() => {}}
              />
            </Tooltip>
          </RenderWhen.False>
        </RenderWhen>
      </div>
      <SlideModal
        modalTitle="Chọn ngày"
        id="RestaurantSettingForm.stopReceiveOrderRangeSlideModal"
        isOpen={isMobileLayout && stopReceiveOrderControl.value}
        onClose={stopReceiveOrderControl.setFalse}>
        {stopReceiveOrderDatePicker}
      </SlideModal>

      <div className={css.fieldContainer}>
        <RenderWhen condition={isMobileLayout}>
          <FieldTextInput
            id="RestaurantSettingForm.dayOffInfo"
            name="dayOffInfo"
            label="Cập nhật lịch nghỉ"
            leftIcon={<IconCalendar />}
            disabled={inProgress}
            onClick={dayOffControl.setTrue}
            onChange={() => {}}
          />
          <RenderWhen.False>
            <Tooltip
              overlayClassName={css.datePickerTooltip}
              overlayInnerStyle={{ backgroundColor: '#ffffff' }}
              showArrow={false}
              tooltipContent={dayOffDatePicker}
              visible={!isMobileLayout && dayOffControl.value}
              trigger="click"
              placement="bottomLeft">
              <FieldTextInput
                id="RestaurantSettingForm.dayOffInfo"
                name="dayOffInfo"
                label="Cập nhật lịch nghỉ"
                disabled={inProgress}
                leftIcon={<IconCalendar />}
                onClick={dayOffControl.setTrue}
                onChange={() => {}}
              />
            </Tooltip>
          </RenderWhen.False>
        </RenderWhen>
      </div>
      <SlideModal
        id="RestaurantSettingForm.dayOffRangeSlideModal"
        isOpen={isMobileLayout && dayOffControl.value}
        onClose={dayOffControl.setFalse}
        modalTitle="Chọn ngày">
        {dayOffDatePicker}
      </SlideModal>
      <AlertModal
        id="RestaurantSettingForm.alertWarningCannotUpdateDayOffRange"
        shouldHideIconClose
        shouldFullScreenInMobile={false}
        containerClassName={css.cannotTurnOffAppStatus}
        childrenClassName={css.cannotTurnOffAppStatusChildren}
        actionsClassName={css.cannotTurnOffAppStatusAction}
        cancelLabel="Huỷ"
        onCancel={cannotUpdateDayOffRangeControl.setFalse}
        isOpen={cannotUpdateDayOffRangeControl.value}
        handleClose={cannotUpdateDayOffRangeControl.setFalse}>
        <div className={css.cannotTurnOffAppStatusContent}>
          <IconDanger className={css.iconDanger} />
          <div className={css.title}>Không thể cập nhật lịch nghỉ</div>
          <div>
            Hiện có{' '}
            <b onClick={handleViewOrdersForDayOff}>
              <u>{inProgressTransactionsInDayOffRange.length} đơn</u>
            </b>{' '}
            đang được triển khai từ ngày{' '}
            {formatTimestamp(
              nearestNextDateHaveInProgressOrderForDayOff.getTime(),
            )}{' '}
            tới{' '}
            {formatTimestamp(
              theBestFarNextDateHaveInProgressOrderForDayOff.getTime(),
            )}
            .
          </div>
        </div>
      </AlertModal>

      <div className={css.fieldContainer}>
        <Field id="RestaurantSettingForm.isActive" name="isActive">
          {(props) => {
            const { id, input } = props;

            return (
              <Toggle
                label={'Tắt app'}
                id={id}
                name={input.name}
                disabled={isToggleAppStatusDisabled || inProgress}
                status={input.value ? 'on' : 'off'}
                onClick={(value) => {
                  if (isEnableTurnOffAppStatus) input.onChange(value);
                  handleToggleStatusClick();
                }}
                className={css.activeAppToggle}
              />
            );
          }}
        </Field>
      </div>
      <AlertModal
        shouldHideIconClose
        shouldFullScreenInMobile={false}
        containerClassName={css.cannotTurnOffAppStatus}
        childrenClassName={css.cannotTurnOffAppStatusChildren}
        actionsClassName={css.cannotTurnOffAppStatusAction}
        cancelLabel="Huỷ"
        onCancel={cannotTurnOffAppStatusControl.setFalse}
        isOpen={cannotTurnOffAppStatusControl.value}
        handleClose={cannotTurnOffAppStatusControl.setFalse}>
        <div className={css.cannotTurnOffAppStatusContent}>
          <IconDanger className={css.iconDanger} />
          <div className={css.title}>Không thể tắt app</div>
          <div>
            Hiện có{' '}
            <b onClick={handleViewOrdersForTurnOffApp}>
              <u>{inProgressTransactionsAfterToDay.length} đơn</u>
            </b>{' '}
            đang được triển khai từ ngày{' '}
            {formatTimestamp(nearestNextDateHaveInProgressOrder.getTime())} tới{' '}
            {formatTimestamp(theBestFarNextDateHaveInProgressOrder.getTime())}.
          </div>
        </div>
      </AlertModal>

      <InProgressOrdersModal
        isOpen={inProgressOrdersModalControl.value}
        onClose={inProgressOrdersModalControl.setFalse}
        orders={currentOrders}
      />

      <LoadingModal isOpen={toggleAppStatusInProgress} />

      <div className={css.divider} />
      <Button
        type="submit"
        inProgress={inProgress}
        disabled={inProgress || disabledSubmitOnDesktopFlow}
        className={css.submitBtn}>
        Lưu thay đổi
      </Button>
    </Form>
  );
};

const RestaurantSettingForm: React.FC<TRestaurantSettingFormProps> = (
  props,
) => {
  return <FinalForm {...props} component={RestaurantSettingFormComponent} />;
};

export default RestaurantSettingForm;
