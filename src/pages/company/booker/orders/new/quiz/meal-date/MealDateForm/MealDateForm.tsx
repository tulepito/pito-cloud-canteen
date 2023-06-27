/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Field, Form as FinalForm } from 'react-final-form';
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
  isGroupOrder: boolean;
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

  const { isGroupOrder } = values;

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

        <Field name={'isGroupOrder'}>
          {(fieldProps) => {
            const { input } = fieldProps;

            return (
              <Toggle
                label={intl.formatMessage({
                  id: 'MealDateForm.orderTypeField.label',
                })}
                id={'MealDateForm.orderType'}
                status={input.value ? 'on' : 'off'}
                className={css.orderTypeField}
                onClick={(value) => {
                  input.onChange(value);
                }}
              />
            );
          }}
        </Field>

        <RenderWhen condition={isGroupOrder}>
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
