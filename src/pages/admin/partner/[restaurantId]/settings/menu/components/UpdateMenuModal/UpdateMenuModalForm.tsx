import Form from '@components/Form/Form';
import type { FormApi } from 'final-form';
import arrayMutators from 'final-form-arrays';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

import FieldMenuApplyTimeGroup from '../FieldMenuApplyTimeGroup/FieldMenuApplyTimeGroup';

export type TUpdateMenuModalFormValues = {
  startDate: Date;
  numberOfCycles: number;
  daysOfWeek: string[];
};

type TExtraProps = {
  formRef: any;
};
type TUpdateMenuModalFormComponentProps =
  FormRenderProps<TUpdateMenuModalFormValues> & Partial<TExtraProps>;
type TUpdateMenuModalFormProps = FormProps<TUpdateMenuModalFormValues> &
  TExtraProps;

const UpdateMenuModalFormComponent: React.FC<
  TUpdateMenuModalFormComponentProps
> = (props) => {
  const { handleSubmit, values, form, formRef } = props;
  formRef.current = form;
  return (
    <Form onSubmit={handleSubmit}>
      <FieldMenuApplyTimeGroup
        values={values}
        form={form as unknown as FormApi}
      />
    </Form>
  );
};

const UpdateMenuModalForm: React.FC<TUpdateMenuModalFormProps> = (props) => {
  return (
    <FinalForm
      {...props}
      mutators={{ ...arrayMutators }}
      component={UpdateMenuModalFormComponent}
    />
  );
};

export default UpdateMenuModalForm;
