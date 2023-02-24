import Form from '@components/Form/Form';
import FieldBankAccounts from '@pages/admin/partner/components/FieldBankAccounts/FieldBankAccounts';
import arrayMutators from 'final-form-arrays';
import { useImperativeHandle } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import { COMPANY_SETTING_PAYMENT_TAB_ID } from '../EditCompanyWizard/utils';
import css from './EditCompanyBankAccounts.module.scss';

export type TEditCompanyBankAccountsFormValues = {
  bankAccounts?: any;
  tabValue?: string;
};

type TExtraProps = {
  formRef: any;
};
type TEditCompanyBankAccountsFormComponentProps =
  FormRenderProps<TEditCompanyBankAccountsFormValues> & Partial<TExtraProps>;
type TEditCompanyBankAccountsFormProps =
  FormProps<TEditCompanyBankAccountsFormValues> & TExtraProps;

const EditCompanyBankAccountsFormComponent: React.FC<
  TEditCompanyBankAccountsFormComponentProps
> = (props) => {
  const { handleSubmit, form, formRef } = props;

  useImperativeHandle(formRef, () => form);

  const intl = useIntl();
  return (
    <Form onSubmit={handleSubmit}>
      <>
        <p className={css.label}>
          {intl.formatMessage({
            id: 'EditPartnerBasicInformationForm.bankLabel',
          })}
        </p>
        <p className={css.description}>
          {intl.formatMessage({
            id: 'EditPartnerBasicInformationForm.bankDescription',
          })}
        </p>
        <FieldBankAccounts id="bankAccounts" name="bankAccounts" />
      </>
    </Form>
  );
};

const EditCompanyBankAccountsForm: React.FC<
  TEditCompanyBankAccountsFormProps
> = (props) => {
  return (
    <FinalForm
      mutators={{ ...arrayMutators }}
      {...props}
      initialValues={{
        ...props.initialValues,
        tabValue: COMPANY_SETTING_PAYMENT_TAB_ID,
      }}
      component={EditCompanyBankAccountsFormComponent}
    />
  );
};

export default EditCompanyBankAccountsForm;
