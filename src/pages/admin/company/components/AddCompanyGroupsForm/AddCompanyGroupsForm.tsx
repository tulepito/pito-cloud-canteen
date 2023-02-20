import Form from '@components/Form/Form';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

export type TAddCompanyGroupsFormValues = {};

type TExtraProps = {};
type TAddCompanyGroupsFormComponentProps =
  FormRenderProps<TAddCompanyGroupsFormValues> & Partial<TExtraProps>;
type TAddCompanyGroupsFormProps = FormProps<TAddCompanyGroupsFormValues> &
  TExtraProps;

const AddCompanyGroupsFormComponent: React.FC<
  TAddCompanyGroupsFormComponentProps
> = (props) => {
  const { handleSubmit } = props;

  return (
    <Form onSubmit={handleSubmit}>
      <></>
    </Form>
  );
};

const AddCompanyGroupsForm: React.FC<TAddCompanyGroupsFormProps> = (props) => {
  return <FinalForm {...props} component={AddCompanyGroupsFormComponent} />;
};

export default AddCompanyGroupsForm;
