/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useField } from 'react-final-form-hooks';
import { useIntl } from 'react-intl';

import Form from '@components/Form/Form';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Toggle from '@components/Toggle/Toggle';
import DayInWeekField from '@pages/admin/order/create/components/DayInWeekField/DayInWeekField';
import DurationForNextOrderField from '@pages/admin/order/create/components/DurationForNextOrderField/DurationForNextOrderField';
import MealPlanDateField from '@pages/admin/order/create/components/MealPlanDateField/MealPlanDateField';
import OrderDeadlineField from '@pages/admin/order/create/components/OrderDeadlineField/OrderDeadlineField';

import css from './MealDateForm.module.scss';

export type TMealDateFormValues = {
  displayedDurationTime: string;
  startDate: number;
  endDate: number;
  deadlineDate: number;
  deadlineHour: string;
  dayInWeek: string[];
  orderType: boolean;
};

type TExtraProps = {
  setFormValues: (values: TMealDateFormValues) => void;
  setFormInvalid: (invalid: boolean) => void;
};
type TMealDateFormComponentProps = FormRenderProps<TMealDateFormValues> &
  Partial<TExtraProps>;
type TMealDateFormProps = FormProps<TMealDateFormValues> & TExtraProps;

const MealDateFormComponent: React.FC<TMealDateFormComponentProps> = (
  props,
) => {
  const { handleSubmit, form, values, setFormValues, invalid, setFormInvalid } =
    props;
  const intl = useIntl();

  const { orderType } = values;
  const orderTypeField = useField('orderType', form);

  const handleChangeOrderType = (checked: boolean) => {
    orderTypeField.input.onChange(checked);
  };

  useEffect(() => {
    setFormValues?.(values);
  }, [JSON.stringify(values)]);

  useEffect(() => {
    setFormInvalid?.(invalid);
  }, [invalid]);

  return (
    <Form onSubmit={handleSubmit}>
      <div className={css.datePickersWrapper}>
        <MealPlanDateField
          form={form}
          values={values}
          columnLayout
          layoutClassName={css.dateLayout}
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
        <DurationForNextOrderField
          containerClassName={css.planDurationFieldContainer}
          form={form}
          displayedDurationTimeValue={values.displayedDurationTime}
          title={intl.formatMessage({
            id: 'MealDateForm.durationForNextOrderField.label',
          })}
        />
        <Toggle
          className={css.orderTypeField}
          onClick={handleChangeOrderType}
          status={orderTypeField.input.value ? 'on' : 'off'}
          label={intl.formatMessage({
            id: 'MealDateForm.orderTypeField.label',
          })}
          name={orderTypeField.input.name}
          id={'MealDateForm.orderType'}
        />

        <RenderWhen condition={orderType}>
          <OrderDeadlineField
            form={form}
            values={values}
            columnLayout
            containerClassName={css.deadlineFieldContainer}
            layoutClassName={css.deadlineFieldLayout}
            deadlineDateLabel={intl.formatMessage({
              id: 'MealDateForm.OrderDeadlineField.label.date',
            })}
            deadlineHourLabel={intl.formatMessage({
              id: 'MealDateForm.OrderDeadlineField.label.hour',
            })}
          />
        </RenderWhen>
      </div>
    </Form>
  );
};

const MealDateForm: React.FC<TMealDateFormProps> = (props) => {
  return <FinalForm {...props} component={MealDateFormComponent} />;
};

export default MealDateForm;
