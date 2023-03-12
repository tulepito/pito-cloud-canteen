import { useEffect, useImperativeHandle } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import Form from '@components/Form/Form';
import NutritionField from '@pages/admin/order/create/components/NutritionField/NutritionField';

import css from './SpecialDemandForm.module.scss';

export type TSpecialDemandFormValues = {
  nutritions: string[];
};

type TExtraProps = {
  formRef: any;
  nutritionsOptions?: { key: string; label: string }[];
  setFormValues: (values: TSpecialDemandFormValues) => void;
};
type TSpecialDemandFormComponentProps =
  FormRenderProps<TSpecialDemandFormValues> & Partial<TExtraProps>;
type TSpecialDemandFormProps = FormProps<TSpecialDemandFormValues> &
  TExtraProps;

const SpecialDemandFormComponent: React.FC<TSpecialDemandFormComponentProps> = (
  props,
) => {
  const {
    handleSubmit,
    formRef,
    form,
    values,
    setFormValues,
    nutritionsOptions,
  } = props;
  const intl = useIntl();

  useImperativeHandle(formRef, () => ({
    submit: () => {
      form.submit();
    },
    getValues: () => {
      return form.getState().values;
    },
  }));
  useEffect(() => {
    setFormValues?.(values);
  }, [setFormValues, JSON.stringify(values)]);

  return (
    <Form onSubmit={handleSubmit}>
      <div className={css.label}>
        {intl.formatMessage({ id: 'Booker.CreateOrder.Form.field.nutritions' })}
      </div>
      <NutritionField options={nutritionsOptions} />
    </Form>
  );
};

const SpecialDemandForm: React.FC<TSpecialDemandFormProps> = (props) => {
  return <FinalForm {...props} component={SpecialDemandFormComponent} />;
};

export default SpecialDemandForm;
