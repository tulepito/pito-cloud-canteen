/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import Alert, { EAlertPosition, EAlertType } from '@components/Alert/Alert';
import Button from '@components/Button/Button';
import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { LocationAutocompleteInputField } from '@components/LocationAutocompleteInput/LocationAutocompleteInput';
import useBoolean from '@hooks/useBoolean';
import {
  composeValidators,
  phoneNumberFormatValid,
  required,
  validURL,
} from '@src/utils/validators';

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

type TExtraProps = {
  disabled?: boolean;
  isSubmitted?: boolean;
  setSubmitted?: (value: boolean) => void;
  onFormChange?: (values: TAccountSettingsFormValues) => void;
};
type TAccountSettingsFormComponentProps =
  FormRenderProps<TAccountSettingsFormValues> & Partial<TExtraProps>;
type TAccountSettingsFormProps = FormProps<TAccountSettingsFormValues> &
  TExtraProps;

const AccountSettingsFormComponent: React.FC<
  TAccountSettingsFormComponentProps
> = (props) => {
  const {
    handleSubmit,
    pristine,
    isSubmitted = false,
    setSubmitted,
    submitting,
    values,
    onFormChange,
    disabled,
  } = props;
  const intl = useIntl();
  const successAlertControl = useBoolean();
  const mountedControl = useBoolean();

  const submitDisabled = pristine;

  const fieldBrandName = {
    label: 'Tên thương hiệu',
    id: 'AccountSettingsForm.fieldBrandName',
    name: 'title',
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
    validate: required(
      intl.formatMessage({
        id: 'AccountSettingsForm.contactorNameRequired',
      }),
    ),
    disabled,
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
    validate: composeValidators(
      required(
        intl.formatMessage({
          id: 'AccountSettingsForm.phoneNumberRequired',
        }),
      ),
      phoneNumberFormatValid(
        intl.formatMessage({
          id: 'AccountSettingsForm.phoneNumberValid',
        }),
      ),
    ),
    disabled,
  };
  const fieldAddress = {
    label: 'Địa chỉ',
    id: 'AccountSettingsForm.fieldAddress',
    name: 'location',
    className: css.fieldLocation,
    inputClassName: css.fieldLocationInput,
    isMultipleLines: true,
    disabled,
  };
  const fieldWebsite = {
    label: 'Website',
    id: 'AccountSettingsForm.fieldWebsite',
    name: 'website',
    placeholder: '-',
    validate: validURL(
      intl.formatMessage({
        id: 'AccountSettingsForm.websiteInvalid',
      }),
    ),
    disabled,
  };
  const fieldFacebookLink = {
    label: 'Trang Facebook',
    id: 'AccountSettingsForm.fieldFacebookLink',
    name: 'facebookLink',
    placeholder: '-',
    validate: validURL(
      intl.formatMessage({
        id: 'AccountSettingsForm.facebookUrlValid',
      }),
    ),
    disabled,
  };

  useEffect(() => {
    mountedControl.setTrue();
  }, []);

  useEffect(() => {
    if (mountedControl.value && typeof onFormChange !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const { website = '', facebookLink = '', ...restValues } = values;

      onFormChange({ website, facebookLink, ...restValues });
    }
  }, [JSON.stringify(values)]);

  useEffect(() => {
    if (isSubmitted) {
      successAlertControl.setTrue();
      if (setSubmitted) {
        setSubmitted(false);
      }
    }
  }, [isSubmitted]);

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
        <div
          className={classNames(css.actionContainer, {
            // if form is disable, submit button will be hidden
            [css.hidden]: disabled,
          })}>
          <Button disabled={submitDisabled} inProgress={submitting}>
            Lưu thay đổi
          </Button>
        </div>
        <Alert
          message="Cập nhật thông tin thành công"
          isOpen={successAlertControl.value}
          autoClose
          onClose={successAlertControl.setFalse}
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
