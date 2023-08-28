/* eslint-disable @typescript-eslint/no-shadow */
import { useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Field, Form as FinalForm } from 'react-final-form';

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
import { Listing } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';

import { PartnerSettingsThunks } from '../../PartnerSettings.slice';

import css from './RestaurantSettingForm.module.scss';

export type TRestaurantSettingFormValues = {};

type TExtraProps = {};
type TRestaurantSettingFormComponentProps =
  FormRenderProps<TRestaurantSettingFormValues> & Partial<TExtraProps>;
type TRestaurantSettingFormProps = FormProps<TRestaurantSettingFormValues> &
  TExtraProps;

const RestaurantSettingFormComponent: React.FC<
  TRestaurantSettingFormComponentProps
> = (props) => {
  const { handleSubmit } = props;
  const dispatch = useAppDispatch();
  const dayOffControl = useBoolean();
  const stopReceiveOrderControl = useBoolean();
  const cannotTurnOffAppStatusControl = useBoolean();
  const toggleAppStatusInProgress = useAppSelector(
    (state) => state.PartnerSettingsPage.toggleAppStatusInProgress,
  );
  const inProgressTransactions = useAppSelector(
    (state) => state.PartnerSettingsPage.inProgressTransactions,
  );
  const restaurantListing = useAppSelector(
    (state) => state.PartnerSettingsPage.restaurantListing,
  );
  const [dayOffRange, setDayOffRange] = useState<any>({
    startDate: null,
    endDate: null,
  });
  const [stopReceiveOrderRange, setStopReceiveOrderRange] = useState<any>({
    startDate: null,
    endDate: null,
  });

  const { isActive = true } = Listing(restaurantListing).getPublicData();

  const today = new Date();
  const inProgressTransactionsAfterToDay = inProgressTransactions
    .reduce((txList, { booking }) => {
      return booking?.attributes?.displayEnd > today
        ? txList.concat(booking?.attributes?.displayStart)
        : txList;
    }, [])
    .sort((a: Date, b: Date) => a.getTime() - b.getTime());
  const inProgressTransactionsAfterToDayCount =
    inProgressTransactionsAfterToDay.length;
  const nearestNextDateHaveInProgressOrder = (
    inProgressTransactionsAfterToDayCount > 0
      ? inProgressTransactionsAfterToDay[0]
      : new Date()
  ).getTime();
  const thebestFarNextDateHaveInProgressOrder = (
    inProgressTransactionsAfterToDayCount > 1
      ? inProgressTransactionsAfterToDay[
          inProgressTransactionsAfterToDayCount - 1
        ]
      : nearestNextDateHaveInProgressOrder
  ).getTime();

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

  return (
    <Form onSubmit={handleSubmit} className={css.formRoot}>
      <div>
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

        <FieldTextInput
          id="RestaurantSettingForm.stopReceiveOrderInfo"
          name="stopReceiveOrderInfo"
          leftIcon={<IconCalendar />}
        />
      </div>
      <FieldTextInput
        id="RestaurantSettingForm.dayOffInfo"
        name="dayOffInfo"
        label="Cập nhật lịch nghỉ"
        leftIcon={<IconCalendar />}
      />

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
            <b>
              <u>{inProgressTransactionsAfterToDay.length} đơn</u>
            </b>{' '}
            đang được triển khai từ ngày{' '}
            {formatTimestamp(nearestNextDateHaveInProgressOrder)} tới{' '}
            {formatTimestamp(thebestFarNextDateHaveInProgressOrder)}.
          </div>
        </div>
      </AlertModal>

      <SlideModal
        id="RestaurantSettingForm.dayOffRangeSlideModal"
        isOpen={dayOffControl.value}
        onClose={dayOffControl.setFalse}>
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
      </SlideModal>

      <SlideModal
        id="RestaurantSettingForm.stopReceiveOrderRangeSlideModal"
        isOpen={stopReceiveOrderControl.value}
        onClose={stopReceiveOrderControl.setFalse}>
        <FieldDateRangePicker
          id="RestaurantSettingForm.stopReceiveOrderRange"
          name="stopReceiveOrderRange"
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
      </SlideModal>

      <LoadingModal isOpen={toggleAppStatusInProgress} />
    </Form>
  );
};

const RestaurantSettingForm: React.FC<TRestaurantSettingFormProps> = (
  props,
) => {
  return <FinalForm {...props} component={RestaurantSettingFormComponent} />;
};

export default RestaurantSettingForm;
