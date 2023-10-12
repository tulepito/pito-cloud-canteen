/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import isEqual from 'lodash/isEqual';

import Form from '@components/Form/Form';
import FieldDaysOfWeekCheckboxGroup from '@components/FormFields/FieldDaysOfWeekCheckboxGroup/FieldDaysOfWeekCheckboxGroup';
import type { EDayOfWeek } from '@src/utils/enums';
import { DAY_OF_WEEK_PRIORITIES } from '@src/utils/enums';

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
  const {
    handleSubmit,
    initialValues,
    values,
    setDaysToApply,
    daysOfWeek = [],
  } = props;

  useEffect(() => {
    if (typeof setDaysToApply !== 'undefined') {
      const updateValue = values.daysToApply.sort(
        (d1, d2) =>
          DAY_OF_WEEK_PRIORITIES[d1 as EDayOfWeek] -
          DAY_OF_WEEK_PRIORITIES[d2 as EDayOfWeek],
      );

      const isOldValue = isEqual(initialValues.daysToApply, updateValue);

      if (!isOldValue) {
        setDaysToApply(updateValue);
      }
    }
  }, [setDaysToApply, JSON.stringify(values)]);

  return (
    <Form onSubmit={handleSubmit}>
      <FieldDaysOfWeekCheckboxGroup
        daysOfWeek={daysOfWeek}
        values={values}
        name="daysToApply"
      />
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
