import { useEffect } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import Form from '@components/Form/Form';
import MealTypeField from '@pages/admin/order/components/MealTypeField/MealTypeField';

import type { TMealStylesFormValues } from '../../meal-styles/MealStylesForm';

import css from './SpecialDemandForm.module.scss';

export type TSpecialDemandFormValues = {
  mealType: string[];
};

type TExtraProps = {
  formValues: Partial<TSpecialDemandFormValues & TMealStylesFormValues>;
  setFormValues: (
    values: Partial<TSpecialDemandFormValues & TMealStylesFormValues>,
  ) => void;
};
type TSpecialDemandFormComponentProps =
  FormRenderProps<TSpecialDemandFormValues> & Partial<TExtraProps>;
type TSpecialDemandFormProps = FormProps<TSpecialDemandFormValues> &
  TExtraProps;

const SpecialDemandFormComponent: React.FC<TSpecialDemandFormComponentProps> = (
  props,
) => {
  const { handleSubmit, values, formValues, setFormValues } = props;
  const intl = useIntl();

  useEffect(() => {
    if (setFormValues) setFormValues?.({ ...formValues, ...values });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values)]);

  return (
    <Form onSubmit={handleSubmit}>
      <div className={css.label}>
        {intl.formatMessage({ id: 'Booker.CreateOrder.Form.field.mealType' })}
      </div>
      <MealTypeField />
    </Form>
  );
};

const SpecialDemandForm: React.FC<TSpecialDemandFormProps> = (props) => {
  return <FinalForm {...props} component={SpecialDemandFormComponent} />;
};

export default SpecialDemandForm;
