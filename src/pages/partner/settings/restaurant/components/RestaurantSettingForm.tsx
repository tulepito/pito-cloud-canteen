/* eslint-disable @typescript-eslint/no-shadow */
import { useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Field, Form as FinalForm } from 'react-final-form';

import Form from '@components/Form/Form';
import FieldDateRangePicker from '@components/FormFields/FieldDateRangePicker/FieldDateRangePicker';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconCalendar from '@components/Icons/IconCalender/IconCalender';
import SlideModal from '@components/SlideModal/SlideModal';
import Toggle from '@components/Toggle/Toggle';
import useBoolean from '@hooks/useBoolean';

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
  const dayOffControl = useBoolean();
  const stopReceiveOrderControl = useBoolean();

  const [dayOffRange, setDayOffRange] = useState<any>({
    startDate: null,
    endDate: null,
  });

  const [stopReceiveOrderRange, setStopReceiveOrderRange] = useState<any>({
    startDate: null,
    endDate: null,
  });

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
              status={input.value ? 'on' : 'off'}
              onClick={(value) => {
                input.onChange(value);
              }}
              className={css.activeAppToggle}
            />
          );
        }}
      </Field>

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
    </Form>
  );
};

const RestaurantSettingForm: React.FC<TRestaurantSettingFormProps> = (
  props,
) => {
  return <FinalForm {...props} component={RestaurantSettingFormComponent} />;
};

export default RestaurantSettingForm;
