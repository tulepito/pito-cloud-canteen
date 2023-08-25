import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';

import css from './BankInfoForm.module.scss';

export type TBankInfoFormValues = {
  bankAccountNumber: string;
  bankAgency: string;
  bankId: string;
  bankOwnerName: string;
};

type TExtraProps = {};
type TBankInfoFormComponentProps = FormRenderProps<TBankInfoFormValues> &
  Partial<TExtraProps>;
type TBankInfoFormProps = FormProps<TBankInfoFormValues> & TExtraProps;

const BankInfoFormComponent: React.FC<TBankInfoFormComponentProps> = (
  props,
) => {
  const { handleSubmit } = props;

  const fieldBankOwnerName = {
    id: 'BankInfoForm.fieldBankOwnerName',
    name: 'bankOwnerName',
    label: 'Tên tài khoản',
    disabled: true,
  };
  const fieldBankId = {
    id: 'BankInfoForm.fieldBankId',
    name: 'bankId',
    label: 'Tên ngân hàng',
    disabled: true,
  };
  const fieldBankAgency = {
    id: 'BankInfoForm.fieldBankAgency',
    name: 'bankAgency',
    label: 'Tên chi nhánh',
    disabled: true,
  };
  const fieldBankAccountNumber = {
    id: 'BankInfoForm.fieldBankAccountNumber',
    name: 'bankAccountNumber',
    label: 'Số tài khoản',
    disabled: true,
  };

  return (
    <Form onSubmit={handleSubmit} className={css.formRoot}>
      <FieldTextInput {...fieldBankOwnerName} />
      <FieldTextInput {...fieldBankId} />
      <FieldTextInput {...fieldBankAgency} />
      <FieldTextInput {...fieldBankAccountNumber} />
    </Form>
  );
};

const BankInfoForm: React.FC<TBankInfoFormProps> = (props) => {
  return <FinalForm {...props} component={BankInfoFormComponent} />;
};

export default BankInfoForm;
