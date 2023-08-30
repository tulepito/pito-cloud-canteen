/* eslint-disable @typescript-eslint/no-shadow */
import { useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Field, Form as FinalForm } from 'react-final-form';
import { OnChange } from 'react-final-form-listeners';

import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldDateRangePicker from '@components/FormFields/FieldDateRangePicker/FieldDateRangePicker';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconCalendar from '@components/Icons/IconCalender/IconCalender';
import IconDanger from '@components/Icons/IconDanger/IconDanger';
import LoadingModal from '@components/LoadingModal/LoadingModal';
import AlertModal from '@components/Modal/AlertModal';
import SlideModal from '@components/SlideModal/SlideModal';
import Toggle from '@components/Toggle/Toggle';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { useViewport } from '@hooks/useViewport';
import { Listing } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';

import { PartnerSettingsThunks } from '../../PartnerSettings.slice';

import InProgressOrdersModal from './InProgressOrderModal';

import css from './RestaurantSettingForm.module.scss';

export type TRestaurantSettingFormValues = {
  stopReceiveOrder: boolean;
  startStopReceiveOrder: number;
  endStopReceiveOrder: number;
  startDayOff: number;
  endDayOff: number;
  isActive: boolean;
};

type TExtraProps = { inProgress?: boolean };
type TRestaurantSettingFormComponentProps =
  FormRenderProps<TRestaurantSettingFormValues> & Partial<TExtraProps>;
type TRestaurantSettingFormProps = FormProps<TRestaurantSettingFormValues> &
  TExtraProps;

const RestaurantSettingFormComponent: React.FC<
  TRestaurantSettingFormComponentProps
> = (props) => {
  const { handleSubmit, inProgress = false, values, initialValues } = props;
  const { isMobileLayout } = useViewport();
  const dispatch = useAppDispatch();
  const stopReceiveOrderControl = useBoolean();
  const dayOffControl = useBoolean();
  const cannotTurnOffAppStatusControl = useBoolean();
  const cannotUpdateDayOffRangeControl = useBoolean();
  const inProgressOrdersModalControl = useBoolean();
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
    startDate: initialValues.startStopReceiveOrder
      ? new Date(initialValues.startStopReceiveOrder)
      : today,
    endDate: initialValues.endStopReceiveOrder
      ? new Date(initialValues.endStopReceiveOrder)
      : today,
  });
  const [dayOffRange, setDayOffRange] = useState<any>({
    startDate: today,
    endDate: today,
  });

  const { isActive = true } = Listing(restaurantListing).getPublicData();

  const handleChangeStopReceiveOrder = (value: boolean) => {
    if (isMobileLayout) {
      dispatch(
        PartnerSettingsThunks.updatePartnerRestaurantListing({
          stopReceiveOrder: value,
        }),
      );
    }
  };

  const isUpdateStopReceiveOrderRangeDisabled =
    stopReceiveOrderRange.startDate === null ||
    stopReceiveOrderRange.endDate === null ||
    stopReceiveOrderRange.startDate > stopReceiveOrderRange.endDate;
  const handleUpdateStopReceiveOrderRangeClick = () => {
    stopReceiveOrderControl.setFalse();

    dispatch(
      PartnerSettingsThunks.updatePartnerRestaurantListing({
        startStopReceiveOrderDate: stopReceiveOrderRange.startDate.getTime(),
        endStopReceiveOrderDate: stopReceiveOrderRange.endDate.getTime(),
        stopReceiveOrder: true,
      }),
    );
  };

  // #region Toggle App status
  const inProgressTransactionsAfterToDay = inProgressTransactions
    .reduce((txList: Date[], { booking }: any) => {
      return booking?.attributes?.displayEnd > today
        ? txList.concat(booking?.attributes?.displayStart)
        : txList;
    }, [])
    .sort((a: Date, b: Date) => a.getTime() - b.getTime()) as Date[];

  const inProgressTransactionsAfterToDayCount =
    inProgressTransactionsAfterToDay.length;
  const nearestNextDateHaveInProgressOrder =
    inProgressTransactionsAfterToDayCount > 0
      ? inProgressTransactionsAfterToDay[0]
      : new Date();
  const theBestFarNextDateHaveInProgressOrder =
    inProgressTransactionsAfterToDayCount > 1
      ? inProgressTransactionsAfterToDay[
          inProgressTransactionsAfterToDayCount - 1
        ]
      : nearestNextDateHaveInProgressOrder;

  const isEnableTurnOffAppStatus =
    !isActive || (isActive && inProgressTransactionsAfterToDayCount === 0);
  const isToggleAppStatusDisabled = toggleAppStatusInProgress;

  const handleToggleStatusClick = () => {
    if (isEnableTurnOffAppStatus) {
      dispatch(PartnerSettingsThunks.toggleRestaurantActiveStatus());
    } else {
      cannotTurnOffAppStatusControl.setTrue();
    }
  };
  // #endregion

  // #region Day off
  const inProgressTransactionsInDayOffRange = inProgressTransactions
    .reduce((txList: Date[], { booking }: any) => {
      const { startDate, endDate } = dayOffRange;

      const bookingEndTime = booking?.attributes?.displayEnd;
      const bookingStartTime = booking?.attributes?.displayStart;

      const validBooking =
        (startDate instanceof Date ? startDate : today) <= bookingStartTime &&
        bookingEndTime <= (endDate instanceof Date ? endDate : today);

      return validBooking
        ? txList.concat(booking?.attributes?.displayStart)
        : txList;
    }, [])
    .sort((a: Date, b: Date) => a.getTime() - b.getTime());

  const inProgressTransactionsInDayOffRangeCount =
    inProgressTransactionsInDayOffRange.length;
  const nearestNextDateHaveInProgressOrderForDayOff =
    inProgressTransactionsInDayOffRangeCount > 0
      ? inProgressTransactionsInDayOffRange[0]
      : new Date();
  const theBestFarNextDateHaveInProgressOrderForDayOff =
    inProgressTransactionsInDayOffRangeCount > 1
      ? inProgressTransactionsInDayOffRange[
          inProgressTransactionsInDayOffRangeCount - 1
        ]
      : nearestNextDateHaveInProgressOrderForDayOff;

  const isEnableUpdateDateOffRangeAppStatus =
    !isActive || (isActive && inProgressTransactionsInDayOffRangeCount === 0);

  const handleUpdateDayOffRangeClick = () => {
    if (isEnableUpdateDateOffRangeAppStatus) {
      dayOffControl.setFalse();
    } else {
      dayOffControl.setFalse();
      cannotUpdateDayOffRangeControl.setTrue();
    }
  };

  const handleViewOrdersForDayOff = () => {
    setCurrentOrders(inProgressTransactionsInDayOffRange);
    inProgressOrdersModalControl.setTrue();
  };
  const handleViewOrdersForTurnOffApp = () => {
    setCurrentOrders(inProgressTransactionsAfterToDay);
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
                className={css.stopReceiveOrderToggle}
              />
            );
          }}
        </Field>
        <OnChange name="stopReceiveOrder">
          {handleChangeStopReceiveOrder}
        </OnChange>

        <FieldTextInput
          id="RestaurantSettingForm.stopReceiveOrderInfo"
          name="stopReceiveOrderInfo"
          leftIcon={<IconCalendar />}
          onClick={stopReceiveOrderControl.setTrue}
          disabled={!values.stopReceiveOrder}
          onChange={() => {}}
        />
      </div>
      <SlideModal
        modalTitle="Chọn ngày"
        id="RestaurantSettingForm.stopReceiveOrderRangeSlideModal"
        isOpen={stopReceiveOrderControl.value}
        onClose={stopReceiveOrderControl.setFalse}>
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
          <Button variant="inline" onClick={dayOffControl.setFalse}>
            Hủy
          </Button>
          <Button
            disabled={isUpdateStopReceiveOrderRangeDisabled}
            onClick={handleUpdateStopReceiveOrderRangeClick}>
            Áp dụng
          </Button>
        </div>
      </SlideModal>

      <div className={css.fieldContainer}>
        <FieldTextInput
          id="RestaurantSettingForm.dayOffInfo"
          name="dayOffInfo"
          label="Cập nhật lịch nghỉ"
          leftIcon={<IconCalendar />}
          onClick={dayOffControl.setTrue}
          onChange={() => {}}
        />
      </div>
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
                disabled={isToggleAppStatusDisabled}
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

      <SlideModal
        id="RestaurantSettingForm.dayOffRangeSlideModal"
        isOpen={dayOffControl.value}
        onClose={dayOffControl.setFalse}
        modalTitle="Chọn ngày">
        <FieldDateRangePicker
          id="RestaurantSettingForm.dayOff"
          name="dayOffRange"
          selected={dayOffRange.startDate}
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
          <Button onClick={handleUpdateDayOffRangeClick}>Áp dụng</Button>
        </div>
      </SlideModal>

      <InProgressOrdersModal
        isOpen={inProgressOrdersModalControl.value}
        onClose={inProgressOrdersModalControl.setFalse}
        orders={currentOrders}
      />

      <LoadingModal isOpen={toggleAppStatusInProgress} />

      <div className={css.divider} />
      <Button type="submit" inProgress={inProgress} className={css.submitBtn}>
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
