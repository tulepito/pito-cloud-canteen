import React, { useState } from 'react';
import { Form as FinalForm } from 'react-final-form';
import { FormattedMessage, useIntl } from 'react-intl';
import isEqual from 'lodash/isEqual';

import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import Form from '@components/Form/Form';
import FieldRadioButton from '@components/FormFields/FieldRadioButton/FieldRadioButton';
import {
  BUSINESS_LICENSE_OPTIONS,
  BUSINESS_TYPE_OPTIONS,
  EImageVariants,
  FOOD_CERTIFICATE_RADIO_OPTIONS,
  NO,
  PARTY_INSURANCE_RADIO_OPTIONS,
  YES,
} from '@utils/enums';

import FieldRadioButtonPhoto from '../FieldRadioButtonPhoto/FieldRadioButtonPhoto';

import css from './EditPartnerLicenseForm.module.scss';

const ACCEPT_IMAGES = 'image/png, image/gif, image/jpeg';
const VARIANTS = [EImageVariants.scaledMedium];

const businessTypeRadioOptions = () => {
  return BUSINESS_LICENSE_OPTIONS.map((value) => {
    if (value.key === YES) {
      return {
        ...value,
        label: (
          <span>
            <FormattedMessage id="EditPartnerLicenseForm.businessLicenseYes" />
            <span className={css.italicFont}>
              <FormattedMessage id="EditPartnerLicenseForm.businessLicenseYesDescription" />
            </span>
          </span>
        ),
      };
    }
    if (value.key === NO) {
      return {
        ...value,
        label: (
          <FormattedMessage id="EditPartnerLicenseForm.businessLicenseNo" />
        ),
      };
    }

    return {
      ...value,
      label: (
        <FormattedMessage id="EditPartnerLicenseForm.businessLicenseRegistering" />
      ),
    };
  });
};

const foodCertificateOptions = () => {
  return FOOD_CERTIFICATE_RADIO_OPTIONS.map((value) => {
    if (value.key === YES) {
      return {
        ...value,
        label: (
          <span>
            <FormattedMessage id="EditPartnerLicenseForm.foodCertificateYes" />
            <span className={css.italicFont}>
              <FormattedMessage id="EditPartnerLicenseForm.foodCertificateYesDescription" />
            </span>
          </span>
        ),
      };
    }
    if (value.key === NO) {
      return {
        ...value,
        label: (
          <FormattedMessage id="EditPartnerLicenseForm.foodCertificateNo" />
        ),
      };
    }

    return {
      ...value,
      label: (
        <FormattedMessage id="EditPartnerLicenseForm.foodCertificateRegistering" />
      ),
    };
  });
};

const partyInsuranceOptions = () => {
  return PARTY_INSURANCE_RADIO_OPTIONS.map((value) => {
    if (value.key === YES) {
      return {
        ...value,
        label: (
          <span>
            <FormattedMessage id="EditPartnerLicenseForm.partyInsuranceYes" />
            <span className={css.italicFont}>
              <FormattedMessage id="EditPartnerLicenseForm.partyInsuranceYesDescription" />
            </span>
          </span>
        ),
      };
    }
    if (value.key === NO) {
      return {
        ...value,
        label: (
          <FormattedMessage id="EditPartnerLicenseForm.partyInsuranceNo" />
        ),
      };
    }
    return {
      ...value,
      label: (
        <FormattedMessage id="EditPartnerLicenseForm.partyInsuranceRegistering" />
      ),
    };
  });
};

const EditPartnerLicenseForm: React.FC<any> = (props) => {
  const intl = useIntl();
  const { onSubmit, ...rest } = props;
  const [submittedValues, setSubmittedValues] = useState<any>();

  const submitFn = async (values: any) => {
    try {
      await onSubmit(values);
      setSubmittedValues(values);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FinalForm
      {...rest}
      onSubmit={submitFn}
      render={(fieldRenderProps: any) => {
        const {
          handleSubmit,
          partnerListingRef,
          formError,
          values,
          uploadedBusinessLicense,
          onBusinessLicenseUpload,
          uploadBusinessLicenseError,
          onRemoveBusinessLicense,
          uploadedFoodCertificate,
          onFoodCertificateUpload,
          uploadFoodCertificateError,
          onRemoveFoodCertificate,
          uploadedPartyInsurance,
          onPartyInsuranceUpload,
          uploadPartyInsuranceError,
          onRemovePartyInsurance,
          inProgress,
          goBack,
          uploadingImage,
        } = fieldRenderProps;
        const ready = !formError && isEqual(submittedValues, values);
        const disabled = inProgress || uploadingImage;
        return (
          <Form onSubmit={handleSubmit}>
            <div className={css.fields}>
              <div className={css.field}>
                <FieldRadioButtonPhoto
                  values={values}
                  name="businessLicense"
                  options={businessTypeRadioOptions()}
                  label={intl.formatMessage({
                    id: 'EditPartnerLicenseForm.businessLicenseLabel',
                  })}
                  image={uploadedBusinessLicense?.[0]}
                  accept={ACCEPT_IMAGES}
                  variants={VARIANTS}
                  onImageUpload={onBusinessLicenseUpload}
                  onRemoveImage={onRemoveBusinessLicense}
                  uploadImageError={uploadBusinessLicenseError}
                />
                <div className={css.businessTypeWrapper}>
                  <div className={css.businessTypeLabel}>
                    {intl.formatMessage({
                      id: 'EditPartnerLicenseForm.businessTypeLabel',
                    })}
                  </div>
                  {BUSINESS_TYPE_OPTIONS.map((opt) => (
                    <FieldRadioButton
                      key={opt.key}
                      id={opt.key}
                      label={opt.label}
                      name="businessType"
                      value={opt.key}
                    />
                  ))}
                </div>
              </div>
              <FieldRadioButtonPhoto
                image={uploadedFoodCertificate?.[0]}
                accept={ACCEPT_IMAGES}
                variants={VARIANTS}
                onImageUpload={onFoodCertificateUpload}
                onRemoveImage={onRemoveFoodCertificate}
                uploadImageError={uploadFoodCertificateError}
                className={css.field}
                values={values}
                name="foodCertificate"
                description={intl.formatMessage({
                  id: 'EditPartnerLicenseForm.foodCertificateDescription',
                })}
                options={foodCertificateOptions()}
                label={intl.formatMessage({
                  id: 'EditPartnerLicenseForm.foodCertificateLabel',
                })}
              />
            </div>
            <div className={css.fields}>
              <FieldRadioButtonPhoto
                image={uploadedPartyInsurance?.[0]}
                accept={ACCEPT_IMAGES}
                variants={VARIANTS}
                onImageUpload={onPartyInsuranceUpload}
                onRemoveImage={onRemovePartyInsurance}
                uploadImageError={uploadPartyInsuranceError}
                values={values}
                className={css.field}
                name="partyInsurance"
                description={intl.formatMessage({
                  id: 'EditPartnerLicenseForm.partyInsuranceDescription',
                })}
                options={partyInsuranceOptions()}
                label={intl.formatMessage({
                  id: 'EditPartnerLicenseForm.partyInsuranceLabel',
                })}
              />
            </div>
            <div>
              {formError && <ErrorMessage message={formError.message} />}
            </div>
            <div className={css.buttonWrapper}>
              <div className={css.buttons}>
                {goBack && (
                  <Button
                    type="button"
                    variant="secondary"
                    // className={css.secondaryButton}
                    onClick={goBack}>
                    {intl.formatMessage({
                      id: 'EditPartnerForms.goBack',
                    })}
                  </Button>
                )}
                <Button
                  inProgress={inProgress}
                  disabled={disabled}
                  ready={ready}
                  className={css.submitButton}>
                  {intl.formatMessage({
                    id: partnerListingRef
                      ? 'EditPartnerLicenseForm.updateBtn'
                      : 'EditPartnerLicenseForm.createBtn',
                  })}
                </Button>
              </div>
            </div>
          </Form>
        );
      }}
    />
  );
};

export default EditPartnerLicenseForm;
