import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import Form from '@components/Form/Form';
import FieldDropdownSelect from '@components/FormFields/FieldDropdownSelect/FieldDropdownSelect';
import FieldTextArea from '@components/FormFields/FieldTextArea/FieldTextArea';

import css from './ServiceFeeAndNoteForm.module.scss';

export type TServiceFeeAndNoteFormValues = {
  restaurant: string;
};

type TExtraProps = {
  restaurantOptions: any[];
  formSubmitRef: any;
};
type TServiceFeeAndNoteFormComponentProps =
  FormRenderProps<TServiceFeeAndNoteFormValues> & Partial<TExtraProps>;
type TServiceFeeAndNoteFormProps = FormProps<TServiceFeeAndNoteFormValues> &
  TExtraProps;

const ServiceFeeAndNoteFormComponent: React.FC<
  TServiceFeeAndNoteFormComponentProps
> = (props) => {
  const { handleSubmit, restaurantOptions, values, formSubmitRef } = props;
  formSubmitRef.current = handleSubmit;

  return (
    <Form onSubmit={handleSubmit}>
      <h3>Dặn dò</h3>
      <FieldDropdownSelect
        className={css.restaurantSelectField}
        id="restaurant"
        options={restaurantOptions}
        placeholder="Chọn nhà nhàng"
        name="restaurant"
      />
      {values.restaurant && (
        <FieldTextArea
          id={`note-${values.restaurant}`}
          name={`note-${values.restaurant}`}
          className={css.noteField}
        />
      )}
    </Form>
  );
};

const ServiceFeeAndNoteForm: React.FC<TServiceFeeAndNoteFormProps> = (
  props,
) => {
  return (
    <FinalForm
      mutators={{
        ...arrayMutators,
      }}
      {...props}
      component={ServiceFeeAndNoteFormComponent}
    />
  );
};

export default ServiceFeeAndNoteForm;
