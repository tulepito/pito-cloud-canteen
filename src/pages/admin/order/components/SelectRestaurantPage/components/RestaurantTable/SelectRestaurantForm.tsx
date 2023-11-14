import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm, FormSpy } from 'react-final-form';
import type { FormState } from 'final-form';

import Form from '@components/Form/Form';

export type TSelectRestaurantFormValues = { restaurant: any };
type TExtraProps = {
  currentRestaurant: any;
  isSelectedRestaurant: boolean;
  onFormChange: (
    form: FormState<
      TSelectRestaurantFormValues,
      Partial<TSelectRestaurantFormValues>
    >,
  ) => void;
};
type TSelectRestaurantFormComponentProps =
  FormRenderProps<TSelectRestaurantFormValues> & Partial<TExtraProps>;
type TSelectRestaurantFormProps = PropsWithChildren<
  FormProps<TSelectRestaurantFormValues> & TExtraProps
>;

const SelectRestaurantFormComponent: React.FC<
  TSelectRestaurantFormComponentProps
> = ({
  handleSubmit,
  children,
  form,
  currentRestaurant,
  isSelectedRestaurant,
  onFormChange,
}) => {
  useEffect(() => {
    if (!!currentRestaurant && isSelectedRestaurant) {
      form.change('restaurant', currentRestaurant?.id?.uuid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(currentRestaurant), isSelectedRestaurant]);

  return (
    <Form onSubmit={handleSubmit}>
      <FormSpy onChange={onFormChange} />
      <>{children}</>
    </Form>
  );
};

const SelectRestaurantForm: React.FC<TSelectRestaurantFormProps> = (props) => {
  return <FinalForm {...props} component={SelectRestaurantFormComponent} />;
};

export default SelectRestaurantForm;
