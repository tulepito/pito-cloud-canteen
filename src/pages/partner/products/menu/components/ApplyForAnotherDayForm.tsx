import { useEffect } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import Form from '@components/Form/Form';
import FieldDaysOfWeekCheckboxGroup from '@components/FormFields/FieldDaysOfWeekCheckboxGroup/FieldDaysOfWeekCheckboxGroup';

export type TApplyForAnotherDayFormValues = {
  daysToApply: string[];
};

type TExtraProps = {
  daysOfWeek: string[];
  setDaysToApply: (value: any) => void;
};
type TApplyForAnotherDayFormComponentProps =
  FormRenderProps<TApplyForAnotherDayFormValues> & Partial<TExtraProps>;
type TApplyForAnotherDayFormProps = FormProps<TApplyForAnotherDayFormValues> &
  TExtraProps;

const ApplyForAnotherDayFormComponent: React.FC<
  TApplyForAnotherDayFormComponentProps
> = (props) => {
  const { handleSubmit, values, setDaysToApply, daysOfWeek = [] } = props;

  useEffect(() => {
    if (setDaysToApply) {
      setDaysToApply(values.daysToApply);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values)]);

  return (
    <Form onSubmit={handleSubmit}>
      <>
        <FieldDaysOfWeekCheckboxGroup
          daysOfWeek={daysOfWeek}
          values={values}
          name="daysToApply"
        />
      </>
    </Form>
  );
};

const ApplyForAnotherDayForm: React.FC<TApplyForAnotherDayFormProps> = (
  props,
) => {
  return (
    <FinalForm
      mutators={{ ...arrayMutators }}
      {...props}
      component={ApplyForAnotherDayFormComponent}
    />
  );
};

export default ApplyForAnotherDayForm;
