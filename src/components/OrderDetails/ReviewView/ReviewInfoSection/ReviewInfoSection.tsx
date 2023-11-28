import React from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import Collapsible from '@components/Collapsible/Collapsible';
import RenderWhen from '@components/RenderWhen/RenderWhen';

import type { TReviewInfoFormValues } from './ReviewInfoForm';
import ReviewInfoForm from './ReviewInfoForm';

import css from './ReviewInfoSection.module.scss';

type TReviewInfoSectionProps = {
  data: {
    deliveryHour: string;
    deliveryAddress: string;
    staffName: string;
    companyName: string;
    contactPeopleName: string;
    contactPeopleEmail: string;
    contactPhoneNumber: string;
    reviewInfoValues?: TReviewInfoFormValues;
  };
  canEdit: boolean;
  setFormValues?: (values: TReviewInfoFormValues, invalid: any) => void;
};

const ReviewInfoSection: React.FC<TReviewInfoSectionProps> = (props) => {
  const {
    data: {
      deliveryAddress,
      staffName,
      companyName,
      contactPeopleName,
      contactPhoneNumber,
      contactPeopleEmail,
      reviewInfoValues = {},
    },
    canEdit,
    setFormValues,
  } = props;
  const intl = useIntl();

  const rootClasses = classNames(css.root);
  const sectionTitle = intl.formatMessage({ id: 'ReviewInfoSection.title' });

  const companyNameField = {
    label: `${intl.formatMessage({
      id: 'ReviewInfoSection.companyNameField.label',
    })}`,
  };

  const deliveryAddressField = {
    label: `${intl.formatMessage({
      id: 'ReviewInfoSection.deliveryAddressField.label',
    })}`,
  };

  const contactPeopleNameField = {
    label: `${intl.formatMessage({
      id: 'ReviewInfoSection.contactPeopleNameField.label',
    })}`,
    requiredText: intl.formatMessage({
      id: 'ReviewInfoSection.contactPeopleNameField.required',
    }),
  };

  const contactPeopleEmailField = {
    label: `${intl.formatMessage({
      id: 'ReviewInfoSection.contactPeopleEmailField.label',
    })}`,
  };

  const contactPhoneNumberField = {
    label: `${intl.formatMessage({
      id: 'ReviewInfoSection.contactPhoneNumberField.label',
    })}`,
    requiredText: intl.formatMessage({
      id: 'ReviewInfoSection.contactPhoneNumberField.required',
    }),
    inValidText: intl.formatMessage({
      id: 'ReviewInfoSection.contactPhoneNumberField.inValid',
    }),
  };

  const staffNameField = {
    label: `${intl.formatMessage({
      id: 'ReviewInfoSection.staffNameField.label',
    })}`,
  };

  const formInitialValues = {
    staffName,
    companyName,
    deliveryAddress,
    contactPeopleName,
    contactPhoneNumber,
    ...reviewInfoValues,
  };

  const infoItemList = [
    [companyNameField.label, companyName],
    [deliveryAddressField.label, deliveryAddress],
    [contactPeopleNameField.label, contactPeopleName],
    [contactPeopleEmailField.label, contactPeopleEmail],
    [contactPhoneNumberField.label, contactPhoneNumber],
    [staffNameField.label, staffName],
  ];

  const defaultSubmitFn = (_values: TReviewInfoFormValues) => {};

  return (
    <Collapsible
      label={sectionTitle}
      labelClassName={css.rootLabel}
      className={rootClasses}
      openClassName={css.rootOpen}>
      <RenderWhen condition={canEdit}>
        <ReviewInfoForm
          onSubmit={defaultSubmitFn}
          initialValues={formInitialValues}
          fieldTextContent={{
            companyNameField,
            staffNameField,
            contactPhoneNumberField,
            contactPeopleNameField,
            deliveryAddressField,
          }}
          setFormValues={setFormValues}
        />
        <RenderWhen.False>
          <div className={css.contentContainer}>
            <div className={css.infoContainer}>
              {infoItemList.map(([label, value], index) => {
                return (
                  <div key={index} className={css.infoItem}>
                    <div className={css.label}>{label}</div>
                    <div className={css.value}>{value}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </RenderWhen.False>
      </RenderWhen>
    </Collapsible>
  );
};

export default ReviewInfoSection;
