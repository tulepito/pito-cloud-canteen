/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import Form from '@components/Form/Form';
import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import FieldDropdownSelect from '@components/FormFields/FieldDropdownSelect/FieldDropdownSelect';
import IconClock from '@components/Icons/IconClock/IconClock';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import DayInWeekField from '@pages/admin/order/components/DayInWeekField/DayInWeekField';
import { generateTimeRangeItems } from '@src/utils/dates';
import { required } from '@src/utils/validators';

import DaySessionField from '../DaySessionField/DaySessionField';
import OrderDateField from '../OrderDateField/OrderDateField';
import OrderDeadlineField from '../OrderDeadlineField/OrderDeadlineField';

import css from './MealDateForm.module.scss';

const TIME_OPTIONS = generateTimeRangeItems({});

export type TMealDateFormValues = {
  startDate: number;
  endDate: number;
  deadlineDate: number;
  dayInWeek: string[];
  isGroupOrder: string[];
  orderDeadlineHour?: string;
  orderDeadlineMinute?: string;
  daySession: string;
};

type TExtraProps = {
  setFormValues: (values: TMealDateFormValues) => void;
  setFormInvalid: (invalid: boolean) => void;
  onClickOrderDates: () => void;
  onClickDeliveryHour: () => void;
  onClickIsGroupOrder: () => void;
  onClickDeadlineDate: () => void;
};
type TMealDateFormComponentProps = FormRenderProps<TMealDateFormValues> &
  Partial<TExtraProps>;
type TMealDateFormProps = FormProps<TMealDateFormValues> & TExtraProps;

const MealDateFormComponent: React.FC<TMealDateFormComponentProps> = (
  props,
) => {
  const {
    handleSubmit,
    form,
    values,
    setFormValues,
    invalid,
    setFormInvalid,
    onClickOrderDates,
    onClickDeliveryHour,
    onClickIsGroupOrder,
    onClickDeadlineDate,
  } = props;
  const intl = useIntl();

  const deliveryHourRequiredMessage = intl.formatMessage({
    id: 'MealPlanDateField.deliveryHourRequired',
  });

  const parsedDeliveryHourOptions = useMemo(
    () =>
      TIME_OPTIONS.map((option) => ({
        label: option.label,
        key: option.key,
      })),
    [],
  );

  const {
    startDate: startDateInitialValue,
    endDate: endDateInitialValue,
    deadlineDate: deadlineDateInitialValue,
    isGroupOrder,
    daySession,
  } = values;

  useEffect(() => {
    setFormValues?.(values);
  }, [JSON.stringify(values)]);

  useEffect(() => {
    const formInvalid =
      invalid ||
      !startDateInitialValue ||
      !endDateInitialValue ||
      !daySession ||
      (isGroupOrder.length > 0 && !deadlineDateInitialValue);
    setFormInvalid?.(formInvalid);
  }, [invalid, JSON.stringify(values)]);

  return (
    <Form onSubmit={handleSubmit}>
      <div className={css.datePickersWrapper}>
        <OrderDateField
          form={form}
          values={values}
          onClick={onClickOrderDates}
        />
        <DayInWeekField
          form={form}
          values={values}
          containerClassName={css.fieldContainer}
          titleClassName={css.fieldTitle}
          fieldGroupClassName={css.fieldGroups}
          title={intl.formatMessage({
            id: 'MealDateForm.dayInWeekField.title',
          })}
        />
        <DaySessionField
          form={form}
          values={values}
          containerClassName={css.fieldContainer}
          titleClassName={css.fieldTitle}
        />

        <div onClick={onClickDeliveryHour}>
          <FieldDropdownSelect
            id="deliveryHour"
            name="deliveryHour"
            label={intl.formatMessage({
              id: 'MealPlanDateField.deliveryHourLabel',
            })}
            className={css.fieldContainer}
            leftIcon={<IconClock />}
            validate={required(deliveryHourRequiredMessage)}
            placeholder={intl.formatMessage({
              id: 'OrderDeadlineField.deliveryHour.placeholder',
            })}
            options={parsedDeliveryHourOptions}
          />
        </div>

        <div className={css.fieldContainer} onClick={onClickIsGroupOrder}>
          <FieldCheckbox
            id="isGroupOrder"
            name="isGroupOrder"
            value="true"
            label="Tôi muốn mời thành viên tham gia chọn món"
          />
        </div>
        <RenderWhen condition={isGroupOrder.length > 0}>
          <div className={css.fieldContainer}>
            <OrderDeadlineField
              form={form}
              values={values}
              onClick={onClickDeadlineDate}
            />
          </div>
        </RenderWhen>
      </div>
    </Form>
  );
};

const MealDateForm: React.FC<TMealDateFormProps> = (props) => {
  return <FinalForm {...props} component={MealDateFormComponent} />;
};

export default MealDateForm;
