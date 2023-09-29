/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import Form from '@components/Form/Form';
import FieldCheckbox from '@components/FormFields/FieldCheckbox/FieldCheckbox';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import DayInWeekField from '@pages/admin/order/create/components/DayInWeekField/DayInWeekField';

import DaySessionField from '../DaySessionField/DaySessionField';
import OrderDateField from '../OrderDateField/OrderDateField';
import OrderDeadlineField from '../OrderDeadlineField/OrderDeadlineField';

import css from './MealDateForm.module.scss';

export type TMealDateFormValues = {
  displayedDurationTime: string;
  startDate: number;
  endDate: number;
  deadlineDate: number;
  deadlineHour: string;
  dayInWeek: string[];
  isGroupOrder: string[];
  orderDeadlineHour?: string;
  orderDeadlineMinute?: string;
  daySession: string;
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
        <OrderDateField form={form} values={values} />
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

        <div className={css.fieldContainer}>
          <FieldCheckbox
            id="isGroupOrder"
            name="isGroupOrder"
            value="true"
            label="Tôi muốn mời thành viên tham gia chọn món"
          />
        </div>
        <RenderWhen condition={isGroupOrder.length > 0}>
          <div className={css.fieldContainer}>
            <OrderDeadlineField form={form} values={values} />
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
