import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

import Form from '@components/Form/Form';

export type TMobileEditPartnerFoodFormValues = {};

type TExtraProps = {};
type TMobileEditPartnerFoodFormComponentProps =
  FormRenderProps<TMobileEditPartnerFoodFormValues> & Partial<TExtraProps>;
type TMobileEditPartnerFoodFormProps =
  FormProps<TMobileEditPartnerFoodFormValues> & TExtraProps;

const MobileEditPartnerFoodFormComponent: React.FC<
  TMobileEditPartnerFoodFormComponentProps
> = (props) => {
  const { handleSubmit } = props;

  return <Form onSubmit={handleSubmit}></Form>;
};

const MobileEditPartnerFoodForm: React.FC<TMobileEditPartnerFoodFormProps> = (
  props,
) => {
  return (
    <FinalForm {...props} component={MobileEditPartnerFoodFormComponent} />
  );
};

export default MobileEditPartnerFoodForm;
