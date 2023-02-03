import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
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
  deliveryAddress: string;
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
    requiredText: intl.formatMessage({
      id: 'ReviewInfoForm.contactPeopleNameField.required',
    }),
  };

  const contactPhoneNumberField = {
    label: `4. ${intl.formatMessage({
      id: 'ReviewInfoForm.contactPhoneNumberField.label',
    })}`,
    requiredText: intl.formatMessage({
      id: 'ReviewInfoForm.contactPhoneNumberField.required',
    }),
    inValidText: intl.formatMessage({
      id: 'ReviewInfoForm.contactPhoneNumberField.inValid',
    }),
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
          disabled
          className={css.fieldInput}
          id="ReviewInfoForm.companyName"
          name="companyName"
        />
      </div>
      <div className={css.fieldContainer}>
        <label
          className={css.fieldLabel}
          htmlFor="ReviewInfoForm.deliveryAddress">
          {deliveryAddressField.label}
        </label>
        <FieldTextInput
          disabled
          rootClassName={css.fieldInput}
          id="ReviewInfoForm.deliveryAddress"
          name="deliveryAddress"
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
          validate={composeValidators(
            required(contactPeopleNameField.requiredText),
          )}
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
            required(contactPhoneNumberField.requiredText),
            phoneNumberFormatValid(contactPhoneNumberField.inValidText),
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
