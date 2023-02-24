import Form from '@components/Form/Form';
import DayInWeekField from '@pages/admin/order/create/components/DayInWeekField/DayInWeekField';
import DurationForNextOrderField from '@pages/admin/order/create/components/DurationForNextOrderField/DurationForNextOrderField';
import MealPlanDateField from '@pages/admin/order/create/components/MealPlanDateField/MealPlanDateField';
import OrderDeadlineField from '@pages/admin/order/create/components/OrderDeadlineField/OrderDeadlineField';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import css from './MealDateForm.module.scss';

export type TMealDateFormValues = {
  displayedDurationTime: string;
};

type TExtraProps = {};
type TMealDateFormComponentProps = FormRenderProps<TMealDateFormValues> &
  Partial<TExtraProps>;
type TMealDateFormProps = FormProps<TMealDateFormValues> & TExtraProps;

const MealDateFormComponent: React.FC<TMealDateFormComponentProps> = (
  props,
) => {
  const { handleSubmit, form, values } = props;
  const intl = useIntl();

  return (
    <Form onSubmit={handleSubmit}>
      <DayInWeekField
        form={form}
        values={values}
        containerClassName={css.fieldContainer}
      />
      <div className={css.separatorLine}></div>
      <div className={css.datePickersWrapper}>
        <MealPlanDateField
          form={form}
          values={values}
          columnLayout
          layoutClassName={css.dateLayout}
        />
        <DurationForNextOrderField
          containerClassName={css.planDurationFieldContainer}
          form={form}
          displayedDurationTimeValue={values.displayedDurationTime}
          title={intl.formatMessage({
            id: 'MealDateForm.durationForNextOrderField.label',
          })}
        />
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
      </div>
    </Form>
  );
};

const MealDateForm: React.FC<TMealDateFormProps> = (props) => {
  return <FinalForm {...props} component={MealDateFormComponent} />;
};

export default MealDateForm;
