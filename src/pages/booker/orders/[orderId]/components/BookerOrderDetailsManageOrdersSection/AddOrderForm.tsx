import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldSelect from '@components/FormFields/FieldSelect/FieldSelect';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import css from './AddOrderForm.module.scss';

export type TAddOrderFormValues = {
  participantId: string;
  foodId: string;
};

type TExtraProps = {};
type TAddOrderFormComponentProps = FormRenderProps<TAddOrderFormValues> &
  Partial<TExtraProps>;
type TAddOrderFormProps = FormProps<TAddOrderFormValues> & TExtraProps;

const AddOrderFormComponent: React.FC<TAddOrderFormComponentProps> = (
  props,
) => {
  const intl = useIntl();
  const { handleSubmit } = props;

  return (
    <Form onSubmit={handleSubmit} className={css.root}>
      <div className={css.fieldContainer}>
        <FieldSelect
          id={'addOrder.participantName'}
          name="participantId"
          selectClassName={css.fieldSelect}>
          <option disabled value="">
            {intl.formatMessage({
              id: 'AddOrderForm.participantIdField.placeholder',
            })}
          </option>
        </FieldSelect>
      </div>
      <div className={css.fieldContainer}>
        <FieldSelect
          id={'addOrder.foodId'}
          name="foodId"
          selectClassName={css.fieldSelect}>
          <option disabled value="">
            {intl.formatMessage({
              id: 'AddOrderForm.foodIdField.placeholder',
            })}
          </option>
        </FieldSelect>
      </div>
      <Button className={css.submitButton}>
        {intl.formatMessage({
          id: 'AddOrderForm.submitButtonText',
        })}
      </Button>
    </Form>
  );
};

const AddOrderForm: React.FC<TAddOrderFormProps> = (props) => {
  return <FinalForm {...props} component={AddOrderFormComponent} />;
};

export default AddOrderForm;
