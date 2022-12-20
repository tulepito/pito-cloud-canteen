import FieldAvailability from '@components/FieldAvailability/FieldAvailability';
import FieldPhotoUpload from '@components/FieldPhotoUpload/FieldPhotoUpload';
import FieldTextInput from '@components/FieldTextInput/FieldTextInput';
import Form from '@components/Form/Form';
import { getDefaultTimeZoneOnBrowser } from '@utils/dates';
import type { TAvailabilityPlan } from '@utils/types';
import arrayMutators from 'final-form-arrays';
import React, { useMemo } from 'react';
import { Form as FinalForm } from 'react-final-form';
import { FormattedMessage, useIntl } from 'react-intl';

import css from './EditPartnerForm.module.scss';

const defaultTimeZone = () =>
  typeof window !== 'undefined' ? getDefaultTimeZoneOnBrowser() : 'Etc/UTC';

type TEditPartnerFormValues = {};

type TEditPartnerForm = {
  initialValues?: TEditPartnerFormValues;
  onSubmit: (e: TEditPartnerFormValues) => void;
  onAvatarUpload: (e: any) => void;
  images: any;
  onRemoveAvatar: (e: any) => void;
  uploadImageError?: any;
};

const createEntryDayGroups = (entries = [{}]) =>
  entries.reduce((groupedEntries: any, entry: any) => {
    const { startTime, endTime: endHour, dayOfWeek } = entry;
    const dayGroup = groupedEntries[dayOfWeek] || [];
    return {
      ...groupedEntries,
      [dayOfWeek]: [
        ...dayGroup,
        {
          startTime,
          endTime: endHour === '00:00' ? '24:00' : endHour,
        },
      ],
    };
  }, {});

// Create initial values
const createInitialValues = (availabilityPlan: TAvailabilityPlan) => {
  const { timezone, entries } = availabilityPlan || {};
  const tz = timezone || defaultTimeZone();
  return {
    timezone: tz,
    ...createEntryDayGroups(entries),
  };
};

const ACCEPT_IMAGES = 'image/png, image/gif, image/jpeg';

const EditPartnerForm: React.FC<TEditPartnerForm> = (props) => {
  const intl = useIntl();
  const defaultAvailabilityPlan = {
    type: 'availability-plan/time',
    timezone: defaultTimeZone(),
    entries: [
      { dayOfWeek: 'mon', startTime: '09:00', endTime: '17:00', seats: 1 },
      { dayOfWeek: 'tue', startTime: '09:00', endTime: '17:00', seats: 1 },
      { dayOfWeek: 'wed', startTime: '09:00', endTime: '17:00', seats: 1 },
      { dayOfWeek: 'thu', startTime: '09:00', endTime: '17:00', seats: 1 },
      { dayOfWeek: 'fri', startTime: '09:00', endTime: '17:00', seats: 1 },
      { dayOfWeek: 'sat', startTime: '09:00', endTime: '17:00', seats: 1 },
      { dayOfWeek: 'sun', startTime: '09:00', endTime: '17:00', seats: 1 },
    ],
  } as TAvailabilityPlan;
  const availabilityPlan = defaultAvailabilityPlan;
  const initialValues = useMemo(
    () => ({
      availabilityPlan: createInitialValues(availabilityPlan),
      allWeekApply: true,
      singleDayApply: true,
    }),
    [availabilityPlan],
  );

  return (
    <FinalForm
      initialValues={initialValues}
      {...props}
      mutators={{ ...arrayMutators }}
      render={(fieldRenderProps: any) => {
        const {
          handleSubmit,
          images,
          onAvatarUpload,
          onRemoveAvatar,
          uploadAvatarError,
          values,
        } = fieldRenderProps;
        return (
          <Form onSubmit={handleSubmit}>
            <div className={css.mediaFields}>
              <p className={css.mediaTitle}>
                <FormattedMessage id="EditPartnerForm.partnerCoverAndAvatar" />
              </p>
              <FieldPhotoUpload
                name="cover"
                image={images[0]}
                accept={ACCEPT_IMAGES}
                id="cover"
                className={css.fieldCover}
                onImageUpload={onAvatarUpload}
                onRemoveImage={onRemoveAvatar}
                uploadImageError={uploadAvatarError}
                multiple
              />
              <FieldPhotoUpload
                name="avatar"
                image={images[0]}
                accept={ACCEPT_IMAGES}
                id="avatar"
                className={css.fieldAvatar}
                onImageUpload={onAvatarUpload}
                onRemoveImage={onRemoveAvatar}
                uploadImageError={uploadAvatarError}
                multiple
              />
            </div>
            <div className={css.fields}>
              <FieldTextInput
                name="brandName"
                className={css.field}
                id="brandName"
                placeholder={intl.formatMessage({
                  id: 'EditPartnerForm.brandNamePlaceholder',
                })}
                label={intl.formatMessage({
                  id: 'EditPartnerForm.brandNameLabel',
                })}
              />
              <FieldTextInput
                name="companyName"
                id="companyName"
                className={css.field}
                placeholder={intl.formatMessage({
                  id: 'EditPartnerForm.companyNamePlaceholder',
                })}
                label={intl.formatMessage({
                  id: 'EditPartnerForm.companyNameLabel',
                })}
              />
            </div>
            <div className={css.fields}>
              <FieldTextInput
                className={css.field}
                name="address"
                id="address"
                placeholder={intl.formatMessage({
                  id: 'EditPartnerForm.addressPlaceholder',
                })}
                label={intl.formatMessage({
                  id: 'EditPartnerForm.addressLabel',
                })}
              />
              <FieldTextInput
                name="contactorName"
                className={css.field}
                id="contactorName"
                placeholder={intl.formatMessage({
                  id: 'EditPartnerForm.contactorPlaceholder',
                })}
                label={intl.formatMessage({
                  id: 'EditPartnerForm.contactorLabel',
                })}
              />
            </div>
            <div className={css.fields}>
              <FieldTextInput
                className={css.field}
                name="phone"
                id="phone"
                placeholder={intl.formatMessage({
                  id: 'EditPartnerForm.phonePlaceholder',
                })}
                label={intl.formatMessage({
                  id: 'EditPartnerForm.phoneLabel',
                })}
              />
              <FieldTextInput
                className={css.field}
                name="email"
                id="email"
                placeholder={intl.formatMessage({
                  id: 'EditPartnerForm.emailPlaceholder',
                })}
                label={intl.formatMessage({
                  id: 'EditPartnerForm.emailLabel',
                })}
              />
            </div>
            <div className={css.fields}>
              <FieldTextInput
                className={css.field}
                name="password"
                id="password"
                placeholder={intl.formatMessage({
                  id: 'EditPartnerForm.passwordPlaceholder',
                })}
                label={intl.formatMessage({
                  id: 'EditPartnerForm.passwordLabel',
                })}
              />
              <FieldTextInput
                className={css.field}
                name="confirmPassword"
                id="confirmPassword"
                placeholder={intl.formatMessage({
                  id: 'EditPartnerForm.confirmPasswordPlaceholder',
                })}
                label={intl.formatMessage({
                  id: 'EditPartnerForm.confirmPasswordLabel',
                })}
              />
            </div>
            <div className={css.fields}>
              <FieldTextInput
                className={css.field}
                name="website"
                id="website"
                placeholder={intl.formatMessage({
                  id: 'EditPartnerForm.websitePlaceholder',
                })}
                label={intl.formatMessage({
                  id: 'EditPartnerForm.websiteLabel',
                })}
              />
              <FieldTextInput
                className={css.field}
                name="facebookLink"
                id="facebookLink"
                placeholder={intl.formatMessage({
                  id: 'EditPartnerForm.facebookPlaceholder',
                })}
                label={intl.formatMessage({
                  id: 'EditPartnerForm.facebookLabel',
                })}
              />
            </div>
            <div className={css.fields}>
              <FieldTextInput
                className={css.field}
                name="introduction"
                id="introduction"
                placeholder={intl.formatMessage({
                  id: 'EditPartnerForm.partnerIntroductionPlaceholder',
                })}
                label={intl.formatMessage({
                  id: 'EditPartnerForm.partnerIntroductionLabel',
                })}
              />
            </div>
            <div className={css.fields}>
              <FieldAvailability
                values={values}
                id="availabilityPlan"
                name="availabilityPlan"
              />
            </div>
          </Form>
        );
      }}
    />
  );
};

export default EditPartnerForm;
