import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import Form from '@components/Form/Form';
import { EImageVariants } from '@utils/enums';
import isEqual from 'lodash/isEqual';
import React, { useState } from 'react';
import { Form as FinalForm } from 'react-final-form';
import { FormattedMessage, useIntl } from 'react-intl';

import FieldRadioButtonPhoto from '../FieldRadioButtonPhoto/FieldRadioButtonPhoto';
import css from './EditPartnerLicenseForm.module.scss';

const ACCEPT_IMAGES = 'image/png, image/gif, image/jpeg';
const VARIANTS = [EImageVariants.scaledMedium];

const BUSINESS_LICENSE_RADIO_OPTIONS = [
  {
    id: 'businessLicense.yes',
    value: 'yes',
    label: (
      <span>
        <FormattedMessage id="EditPartnerLicenseForm.businessLicenseYes" />
        <span className={css.italicFont}>
          <FormattedMessage id="EditPartnerLicenseForm.businessLicenseYesDescription" />
        </span>
      </span>
    ),
    hasImage: true,
  },
  {
    id: 'businessLicense.registering',
    value: 'registering',
    label: (
      <FormattedMessage id="EditPartnerLicenseForm.businessLicenseRegistering" />
    ),
  },
  {
    id: 'businessLicense.no',
    value: 'no',
    label: <FormattedMessage id="EditPartnerLicenseForm.businessLicenseNo" />,
  },
];

const FOOD_CERTIFICATE_RADIO_OPTIONS = [
  {
    id: 'foodCertificate.yes',
    value: 'yes',
    label: (
      <span>
        <FormattedMessage id="EditPartnerLicenseForm.foodCertificateYes" />
        <span className={css.italicFont}>
          <FormattedMessage id="EditPartnerLicenseForm.foodCertificateYesDescription" />
        </span>
      </span>
    ),
    hasImage: true,
  },
  {
    id: 'foodCertificate.registering',
    value: 'registering',
    label: (
      <FormattedMessage id="EditPartnerLicenseForm.foodCertificateRegistering" />
    ),
  },
  {
    id: 'foodCertificate.no',
    value: 'no',
    label: <FormattedMessage id="EditPartnerLicenseForm.foodCertificateNo" />,
  },
];

const PARTY_INSURANCE_RADIO_OPTIONS = [
  {
    id: 'partyInsurance.yes',
    value: 'yes',
    label: (
      <span>
        <FormattedMessage id="EditPartnerLicenseForm.partyInsuranceYes" />
        <span className={css.italicFont}>
          <FormattedMessage id="EditPartnerLicenseForm.partyInsuranceYesDescription" />
        </span>
      </span>
    ),
    hasImage: true,
  },
  {
    id: 'partyInsurance.registering',
    value: 'registering',
    label: (
      <FormattedMessage id="EditPartnerLicenseForm.partyInsuranceRegistering" />
    ),
  },
  {
    id: 'partyInsurance.no',
    value: 'no',
    label: <FormattedMessage id="EditPartnerLicenseForm.partyInsuranceNo" />,
  },
];

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
        } = fieldRenderProps;
        const ready = !formError && isEqual(submittedValues, values);

        return (
          <Form onSubmit={handleSubmit}>
            <div className={css.fields}>
              <FieldRadioButtonPhoto
                values={values}
                className={css.field}
                name="businessLicense"
                options={BUSINESS_LICENSE_RADIO_OPTIONS}
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
                options={FOOD_CERTIFICATE_RADIO_OPTIONS}
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
                options={PARTY_INSURANCE_RADIO_OPTIONS}
                label={intl.formatMessage({
                  id: 'EditPartnerLicenseForm.partyInsuranceLabel',
                })}
              />
            </div>
            <div className={css.buttonWrapper}>
              <div>
                {formError && <ErrorMessage message={formError.message} />}
              </div>
              <Button
                inProgress={inProgress}
                disabled={inProgress}
                ready={ready}
                className={css.submitButton}>
                {intl.formatMessage({
                  id: partnerListingRef
                    ? 'EditPartnerLicenseForm.updateBtn'
                    : 'EditPartnerLicenseForm.createBtn',
                })}
              </Button>
            </div>
          </Form>
        );
      }}
    />
  );
};

export default EditPartnerLicenseForm;
