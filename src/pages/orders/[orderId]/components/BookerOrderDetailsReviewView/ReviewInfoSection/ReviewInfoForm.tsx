import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { LocationAutocompleteInputField } from '@components/LocationAutocompleteInput/LocationAutocompleteInput';
import type { TObject } from '@utils/types';
import {
  composeValidators,
  phoneNumberFormatValid,
  required,
} from '@utils/validators';
import { useEffect, useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';
import { useIntl } from 'react-intl';

import css from './ReviewInfoForm.module.scss';

export type TReviewInfoFormValues = {
  companyName: string;
  contactPeopleName: string;
  contactPhoneNumber: string;
  staffName: string;
  deliveryAddress: TObject;
};

type TExtraProps = {
  startSubmit: boolean;
};
type TReviewInfoFormComponentProps = FormRenderProps<TReviewInfoFormValues> &
  Partial<TExtraProps>;
type TReviewInfoFormProps = FormProps<TReviewInfoFormValues> & TExtraProps;

const ReviewInfoFormComponent: React.FC<TReviewInfoFormComponentProps> = (
  props,
) => {
  const { handleSubmit, form, startSubmit, modifiedSinceLastSubmit } = props;
  const intl = useIntl();
  const [isMounted, setIsMounted] = useState(false);

  const companyNameField = {
    label: `1. ${intl.formatMessage({
      id: 'ReviewInfoForm.companyNameField.label',
    })}`,
  };

  const deliveryAddressField = {
    label: `2. ${intl.formatMessage({
      id: 'ReviewInfoForm.deliveryAddressField.label',
    })}`,
  };

  const contactPeopleNameField = {
    label: `3. ${intl.formatMessage({
      id: 'ReviewInfoForm.contactPeopleNameField.label',
    })}`,
  };

  const contactPhoneNumberField = {
    label: `4. ${intl.formatMessage({
      id: 'ReviewInfoForm.contactPhoneNumberField.label',
    })}`,
  };

  const staffNameField = {
    label: `5. ${intl.formatMessage({
      id: 'ReviewInfoForm.staffNameField.label',
    })}`,
  };

  useEffect(() => {
    if (isMounted && (modifiedSinceLastSubmit || startSubmit)) {
      form.submit();
    }
  }, [startSubmit, modifiedSinceLastSubmit, isMounted]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Form onSubmit={handleSubmit} className={css.formContainer}>
      <div className={css.fieldContainer}>
        <label className={css.fieldLabel} htmlFor="ReviewInfoForm.companyName">
          {companyNameField.label}
        </label>
        <FieldTextInput
          className={css.fieldInput}
          id="ReviewInfoForm.companyName"
          name="companyName"
          validate={composeValidators(required('Nhập tên công ty'))}
        />
      </div>
      <div className={css.fieldContainer}>
        <label
          className={css.fieldLabel}
          htmlFor="ReviewInfoForm.deliveryAddress">
          {deliveryAddressField.label}
        </label>
        <LocationAutocompleteInputField
          rootClassName={css.fieldInput}
          id="ReviewInfoForm.deliveryAddress"
          name="deliveryAddress"
          validate={composeValidators(required('Nhập địa chỉ giao hàng'))}
        />
      </div>
      <div className={css.fieldContainer}>
        <label
          className={css.fieldLabel}
          htmlFor="ReviewInfoForm.contactPeopleName">
          {contactPeopleNameField.label}
        </label>
        <FieldTextInput
          className={css.fieldInput}
          id="ReviewInfoForm.contactPeopleName"
          name="contactPeopleName"
          validate={composeValidators(required('Nhập tên người liên hệ'))}
        />
      </div>
      <div className={css.fieldContainer}>
        <label
          className={css.fieldLabel}
          htmlFor="ReviewInfoForm.contactPhoneNumber">
          {contactPhoneNumberField.label}
        </label>
        <FieldTextInput
          className={css.fieldInput}
          id="ReviewInfoForm.contactPhoneNumber"
          name="contactPhoneNumber"
          validate={composeValidators(
            required('Nhập số điện thoại'),
            phoneNumberFormatValid('Nhập đúng định dạng số điện thoại'),
          )}
        />
      </div>
      <div className={css.fieldContainer}>
        <label className={css.fieldLabel} htmlFor="ReviewInfoForm.staffName">
          {staffNameField.label}
        </label>
        <FieldTextInput
          className={css.fieldInput}
          disabled
          id="ReviewInfoForm.staffName"
          name="staffName"
        />
      </div>
    </Form>
  );
};

const ReviewInfoForm: React.FC<TReviewInfoFormProps> = (props) => {
  return <FinalForm {...props} component={ReviewInfoFormComponent} />;
};

export default ReviewInfoForm;
