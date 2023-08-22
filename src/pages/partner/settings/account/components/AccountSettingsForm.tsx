import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

import Alert, { EAlertPosition, EAlertType } from '@components/Alert/Alert';
import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { LocationAutocompleteInputField } from '@components/LocationAutocompleteInput/LocationAutocompleteInput';

import css from './AccountSettingsForm.module.scss';

export type TAccountSettingsFormValues = {
  brandName: string;
  companyName: string;
  contactorName: string;
  email: string;
  phoneNumber: string;
  website: string;
  address: string;
  facebookLink: string;
};

type TExtraProps = {};
type TAccountSettingsFormComponentProps =
  FormRenderProps<TAccountSettingsFormValues> & Partial<TExtraProps>;
type TAccountSettingsFormProps = FormProps<TAccountSettingsFormValues> &
  TExtraProps;

const AccountSettingsFormComponent: React.FC<
  TAccountSettingsFormComponentProps
> = (props) => {
  const { handleSubmit } = props;

  const fieldBrandName = {
    label: 'Tên thương hiệu',
    id: 'AccountSettingsForm.fieldBrandName',
    name: 'brandName',
    disabled: true,
  };
  const fieldCompanyName = {
    label: 'Tên công ty/hộ kinh doanh',
    id: 'AccountSettingsForm.fieldCompanyName',
    name: 'companyName',
    disabled: true,
  };
  const fieldContactorName = {
    label: 'Người đại diện',
    id: 'AccountSettingsForm.fieldContactorName',
    name: 'contactorName',
  };
  const fieldEmail = {
    label: 'Email',
    id: 'AccountSettingsForm.fieldEmail',
    name: 'email',
    disabled: true,
  };
  const fieldPhoneNumber = {
    label: 'Điện thoại',
    id: 'AccountSettingsForm.fieldPhoneNumber',
    name: 'phoneNumber',
    disabled: true,
  };
  const fieldAddress = {
    label: 'Địa chỉ',
    id: 'AccountSettingsForm.fieldAddress',
    name: 'address',
    className: css.fieldLocation,
  };
  const fieldWebsite = {
    label: 'Website',
    id: 'AccountSettingsForm.fieldWebsite',
    name: 'website',
    placeholder: '-',
  };
  const fieldFacebookLink = {
    label: 'Trang Facebook',
    id: 'AccountSettingsForm.fieldFacebookLink',
    name: 'facebookLink',
    placeholder: '-',
  };

  return (
    <Form onSubmit={handleSubmit} className={css.formRoot}>
      <>
        <FieldTextInput {...fieldBrandName} />
        <FieldTextInput {...fieldCompanyName} />
        <FieldTextInput {...fieldContactorName} />
        <FieldTextInput {...fieldEmail} />
        <FieldTextInput {...fieldPhoneNumber} />
        <LocationAutocompleteInputField {...fieldAddress} />
        <FieldTextInput {...fieldWebsite} />
        <FieldTextInput {...fieldFacebookLink} />
        <Button>Lưu thay đổi</Button>
        <Alert
          message="Cập nhật thông tin thành công"
          isOpen
          autoClose
          onClose={() => {}}
          type={EAlertType.success}
          hasCloseButton={false}
          position={EAlertPosition.bottomLeft}
          messageClassName={css.alertMessage}
        />
      </>
    </Form>
  );
};

const AccountSettingsForm: React.FC<TAccountSettingsFormProps> = (props) => {
  return <FinalForm {...props} component={AccountSettingsFormComponent} />;
};

export default AccountSettingsForm;
