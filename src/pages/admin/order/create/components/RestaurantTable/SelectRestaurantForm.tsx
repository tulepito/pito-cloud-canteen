import Form from '@components/Form/Form';
import type { ReactNode } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

export type TSelectRestaurantFormValues = {};
type TExtraProps = { items: ReactNode };
type TSelectRestaurantFormComponentProps =
  FormRenderProps<TSelectRestaurantFormValues> & Partial<TExtraProps>;
type TSelectRestaurantFormProps = FormProps<TSelectRestaurantFormValues> &
  TExtraProps;

const SelectRestaurantFormComponent: React.FC<
  TSelectRestaurantFormComponentProps
> = ({ handleSubmit, items }) => {
  return <Form onSubmit={handleSubmit}>{items}</Form>;
};

const SelectRestaurantForm: React.FC<TSelectRestaurantFormProps> = (props) => {
  return <FinalForm {...props} component={SelectRestaurantFormComponent} />;
};

export default SelectRestaurantForm;
