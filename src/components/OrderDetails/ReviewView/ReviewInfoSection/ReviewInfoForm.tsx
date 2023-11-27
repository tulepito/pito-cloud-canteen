import { useEffect, useState } from 'react';
import type { FormProps, FormRenderProps } from 'react-final-form';
import { Form as FinalForm } from 'react-final-form';

import Form from '@components/Form/Form';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import type { TObject } from '@utils/types';
import {
  composeValidators,
  phoneNumberFormatValid,
  required,
} from '@utils/validators';

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
  fieldTextContent: {
    companyNameField: TObject;
    staffNameField: TObject;
    contactPhoneNumberField: TObject;
    contactPeopleNameField: TObject;
    deliveryAddressField: TObject;
  };
};
type TReviewInfoFormComponentProps = FormRenderProps<TReviewInfoFormValues> &
  Partial<TExtraProps>;
type TReviewInfoFormProps = FormProps<TReviewInfoFormValues> & TExtraProps;

const ReviewInfoFormComponent: React.FC<TReviewInfoFormComponentProps> = (
  props,
) => {
  const {
    handleSubmit,
    form,
    startSubmit,
    modifiedSinceLastSubmit,
    fieldTextContent: {
      companyNameField,
      staffNameField,
      contactPhoneNumberField,
      contactPeopleNameField,
      deliveryAddressField,
    } = {},
  } = props;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isMounted && (modifiedSinceLastSubmit || startSubmit)) {
      form.submit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startSubmit, modifiedSinceLastSubmit, isMounted]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Form onSubmit={handleSubmit} className={css.formContainer}>
      <div className={css.fieldContainer}>
        <label className={css.fieldLabel} htmlFor="ReviewInfoForm.companyName">
          {companyNameField?.label}
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
          {deliveryAddressField?.label}
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
          {contactPeopleNameField?.label}
        </label>
        <FieldTextInput
          className={css.fieldInput}
          id="ReviewInfoForm.contactPeopleName"
          name="contactPeopleName"
          validate={composeValidators(
            required(contactPeopleNameField?.requiredText),
          )}
        />
      </div>
      <div className={css.fieldContainer}>
        <label
          className={css.fieldLabel}
          htmlFor="ReviewInfoForm.contactPhoneNumber">
          {contactPhoneNumberField?.label}
        </label>
        <FieldTextInput
          className={css.fieldInput}
          id="ReviewInfoForm.contactPhoneNumber"
          name="contactPhoneNumber"
          validate={composeValidators(
            required(contactPhoneNumberField?.requiredText),
            phoneNumberFormatValid(contactPhoneNumberField?.inValidText),
          )}
        />
      </div>
      <div className={css.fieldContainer}>
        <label className={css.fieldLabel} htmlFor="ReviewInfoForm.staffName">
          5. {staffNameField?.label}
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
