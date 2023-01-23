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
  requirement: string;
};

type TExtraProps = {
  foodOptions: {
    foodId: string;
    foodName: string;
  }[];
  memberOptions: {
    memberId: string;
    memberName: string;
  }[];
};
type TAddOrderFormComponentProps = FormRenderProps<TAddOrderFormValues> &
  Partial<TExtraProps>;
type TAddOrderFormProps = FormProps<TAddOrderFormValues> & TExtraProps;

const AddOrderFormComponent: React.FC<TAddOrderFormComponentProps> = (
  props,
) => {
  const intl = useIntl();
  const { foodOptions, memberOptions, handleSubmit } = props;
  const fieldSelectMemberDisable = memberOptions?.length === 0;
  const fieldSelectFoodDisable =
    fieldSelectMemberDisable || foodOptions?.length === 0;

  const selectMemberOptions = (
    <>
      <option disabled value="">
        {intl.formatMessage({
          id: 'AddOrderForm.participantIdField.placeholder',
        })}
      </option>

      {memberOptions?.map(({ memberId, memberName }) => (
        <option key={memberId} value={memberId}>
          {memberName}
        </option>
      ))}
    </>
  );
  const selectFoodOptions = (
    <>
      <option disabled value="">
        {intl.formatMessage({
          id: 'AddOrderForm.foodIdField.placeholder',
        })}
      </option>

      {foodOptions?.map(({ foodId, foodName }) => (
        <option key={foodId} value={foodId}>
          {foodName}
        </option>
      ))}
    </>
  );

  return (
    <Form onSubmit={handleSubmit} className={css.root}>
      <div className={css.fieldContainer}>
        <FieldSelect
          disabled={fieldSelectMemberDisable}
          id={'addOrder.participantName'}
          name="participantId"
          selectClassName={css.fieldSelect}>
          {selectMemberOptions}
        </FieldSelect>
      </div>
      <div className={css.fieldContainer}>
        <FieldSelect
          disabled={fieldSelectFoodDisable}
          id={'addOrder.foodId'}
          name="foodId"
          selectClassName={css.fieldSelect}>
          {selectFoodOptions}
        </FieldSelect>
      </div>
      <Button disabled={fieldSelectMemberDisable} className={css.submitButton}>
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
