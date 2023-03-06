import React, { useMemo, useRef, useState } from 'react';
import { Field, Form as FinalForm } from 'react-final-form';
import { FormattedMessage, useIntl } from 'react-intl';
import arrayMutators from 'final-form-arrays';
import isEqual from 'lodash/isEqual';

import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import Form from '@components/Form/Form';
import FieldAvailability, {
  SINGLE_DAY_APPLY,
} from '@components/FormFields/FieldAvailability/FieldAvailability';
import FieldCheckboxGroup from '@components/FormFields/FieldCheckboxGroup/FieldCheckboxGroup';
import FieldPasswordInput from '@components/FormFields/FieldPasswordInput/FieldPasswordInput';
import FieldPhotoUpload from '@components/FormFields/FieldPhotoUpload/FieldPhotoUpload';
import FieldTextArea from '@components/FormFields/FieldTextArea/FieldTextArea';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import { LocationAutocompleteInputField } from '@components/LocationAutocompleteInput/LocationAutocompleteInput';
import ToggleButton from '@components/ToggleButton/ToggleButton';
import { useViewport } from '@hooks/useViewport';
import { EImageVariants, OTHER_OPTION, PACKAGING_OPTIONS } from '@utils/enums';
import { isUploadImageOverLimitError } from '@utils/errors';
import type { TImage } from '@utils/types';
import {
  autocompletePlaceSelected,
  autocompleteSearchRequired,
  composeValidators,
  composeValidatorsWithAllValues,
  emailFormatValid,
  minLength,
  minPriceLength,
  nonEmptyImage,
  parsePrice,
  passwordFormatValid,
  passwordMatchConfirmPassword,
  phoneNumberFormatValid,
  required,
  validFacebookUrl,
  validURL,
} from '@utils/validators';

import {
  createAvailabilityPlanInitialValues,
  createDayToApplyInitialValues,
  defaultTimeZone,
  getLocationInitialValues,
} from '../EditPartnerWizardTab/utils';
import FieldBankAccounts from '../FieldBankAccounts/FieldBankAccounts';

import css from './EditPartnerBasicInformationForm.module.scss';

// const identity = (v: any) => v;

type TEditPartnerBasicInformationFormValues = {};

type TEditPartnerBasicInformationForm = {
  initialValues?: TEditPartnerBasicInformationFormValues;
  onSubmit: (e: TEditPartnerBasicInformationFormValues) => void;
  inProgress: boolean;
  formError?: any;

  onAvatarUpload: (e: any) => void;
  onCoverUpload: (e: any) => void;

  uploadedAvatars: TImage[];
  uploadedCovers: TImage[];

  onRemoveAvatar: (e: any) => void;
  onRemoveCover: (e: any) => void;

  uploadCoverError?: any;
  uploadAvatarError?: any;

  partnerListingRef?: any;
};

const ACCEPT_IMAGES = 'image/png, image/gif, image/jpeg';
const COVER_VARIANTS = [EImageVariants.scaledMedium];
const AVATAR_VARIANTS = [EImageVariants.squareSmall2x];

const EditPartnerBasicInformationForm: React.FC<
  TEditPartnerBasicInformationForm
> = (props) => {
  const { onSubmit, partnerListingRef, ...rest } = props;
  const [submittedValues, setSubmittedValues] = useState<any>();
  const intl = useIntl();
  const { isMobileLayout } = useViewport();
  const searchInputRef = useRef();

  const defaultAvailabilityPlan = {
    type: 'availability-plan/time',
    timezone: defaultTimeZone(),
    entries: [
      { dayOfWeek: 'mon', startTime: '06:30', endTime: '23:00', seats: 100 },
    ],
  };

  const {
    availabilityPlan: listingAvailability = {},
    publicData = {},
    privateData = {},
    title,
    description,
  } = partnerListingRef?.attributes || {};

  const availabilityPlan = partnerListingRef
    ? listingAvailability
    : defaultAvailabilityPlan;

  const {
    vat,
    companyName,
    contactorName,
    website,
    packaging = [],
    availabilityApplyType,
    facebookLink,
    minPrice,
    phoneNumber,
    allWeekAvailabilityEntries,
    packagingOther,
    minQuantity,
    maxQuantity,
  } = publicData;
  const { bankAccounts } = privateData;
  const defaultBankAccounts = [
    {
      bankId: '',
      bankAgency: '',
      bankAccountNumber: '',
      bankOwnerName: '',
      isDefault: true,
    },
  ];

  const initialValues = useMemo(
    () => ({
      allWeekAvailabilityEntries: allWeekAvailabilityEntries || [
        {
          startTime: '06:30',
          endTime: '23:00',
        },
      ],
      availabilityPlan: createAvailabilityPlanInitialValues(availabilityPlan),
      availabilityApplyType: availabilityApplyType || SINGLE_DAY_APPLY,
      daysToApply: createDayToApplyInitialValues(availabilityPlan),
      vat,
      title,
      companyName,
      location: partnerListingRef
        ? getLocationInitialValues(partnerListingRef)
        : {},
      contactorName,
      phoneNumber,
      website,
      facebookLink,
      description,
      packaging: [...packaging, ...(packagingOther ? [OTHER_OPTION] : [])],
      minPrice: parsePrice(minPrice),
      bankAccounts: bankAccounts || defaultBankAccounts,
      packagingOther,
      minQuantity,
      maxQuantity,
    }),
    [],
  );

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
      initialValues={initialValues}
      onSubmit={submitFn}
      mutators={{ ...arrayMutators }}
      render={(fieldRenderProps: any) => {
        const {
          handleSubmit,
          uploadedAvatars,
          uploadedCovers,
          onAvatarUpload,
          onCoverUpload,

          onRemoveAvatar,
          onRemoveCover,
          uploadAvatarError,
          uploadCoverError,
          values,
          form,

          formError,
          inProgress,
        } = fieldRenderProps;

        const ready = !formError && isEqual(submittedValues, values);
        const uploadImageError = uploadAvatarError || uploadCoverError;
        const uploadOverLimit = isUploadImageOverLimitError(uploadImageError);

        let uploadImageFailed = null;

        if (uploadOverLimit) {
          uploadImageFailed = intl.formatMessage({
            id: 'FieldPhotoUpload.imageUploadFailed.uploadOverLimit',
          });
        } else if (uploadImageError) {
          uploadImageFailed = intl.formatMessage({
            id: 'FieldPhotoUpload.imageUploadFailed.uploadFailed',
          });
        }

        return (
          <Form className={css.root} onSubmit={handleSubmit}>
            <div className={css.mediaFields}>
              <h3 className={css.mediaTitle}>
                <FormattedMessage id="EditPartnerForm.partnerCoverAndAvatar" />
              </h3>
              <div className={css.mediaFieldGroup}>
                <FieldPhotoUpload
                  name="cover"
                  accept={ACCEPT_IMAGES}
                  id="cover"
                  className={css.fieldCover}
                  image={uploadedCovers?.[0]}
                  variants={COVER_VARIANTS}
                  onImageUpload={onCoverUpload}
                  onRemoveImage={onRemoveCover}
                  validate={nonEmptyImage(
                    intl.formatMessage({
                      id: 'EditPartnerBasicInformationForm.coverRequired',
                    }),
                  )}
                />
                <FieldPhotoUpload
                  name="avatar"
                  image={uploadedAvatars?.[0]}
                  accept={ACCEPT_IMAGES}
                  id="avatar"
                  className={css.fieldAvatar}
                  onImageUpload={onAvatarUpload}
                  onRemoveImage={onRemoveAvatar}
                  variants={AVATAR_VARIANTS}
                  validate={nonEmptyImage(
                    intl.formatMessage({
                      id: 'EditPartnerBasicInformationForm.avatarRequired',
                    }),
                  )}
                />
                {uploadImageFailed && (
                  <ErrorMessage message={uploadImageFailed} />
                )}
              </div>
            </div>
            <div className={css.fields}>
              <FieldTextInput
                name="title"
                className={css.field}
                id="title"
                placeholder={intl.formatMessage({
                  id: 'EditPartnerForm.brandNamePlaceholder',
                })}
                label={intl.formatMessage({
                  id: 'EditPartnerForm.brandNameLabel',
                })}
                validate={required(
                  intl.formatMessage({
                    id: 'EditPartnerBasicInformationForm.titleRequired',
                  }),
                )}
                required
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
                validate={required(
                  intl.formatMessage({
                    id: 'EditPartnerBasicInformationForm.companyNameRequired',
                  }),
                )}
                required
              />
              <LocationAutocompleteInputField
                name="location"
                label={intl.formatMessage({
                  id: 'EditCompanyForm.addressLabel',
                })}
                rootClassName={css.field}
                placeholder={intl.formatMessage({
                  id: 'EditPartnerForm.addressPlaceholder',
                })}
                closeOnBlur={!isMobileLayout}
                inputRef={searchInputRef}
                validate={composeValidators(
                  autocompleteSearchRequired(
                    intl.formatMessage({
                      id: 'EditPartnerBasicInformationForm.locationRequried',
                    }),
                  ),
                  autocompletePlaceSelected(
                    intl.formatMessage({
                      id: 'EditPartnerBasicInformationForm.validLocation',
                    }),
                  ),
                )}
                required
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
                validate={required(
                  intl.formatMessage({
                    id: 'EditPartnerBasicInformationForm.contactorNameRequired',
                  }),
                )}
                required
              />
              <FieldTextInput
                className={css.field}
                name="phoneNumber"
                id="phoneNumber"
                placeholder={intl.formatMessage({
                  id: 'EditPartnerForm.phonePlaceholder',
                })}
                label={intl.formatMessage({
                  id: 'EditPartnerForm.phoneLabel',
                })}
                validate={composeValidators(
                  required(
                    intl.formatMessage({
                      id: 'EditPartnerBasicInformationForm.phoneNumberRequired',
                    }),
                  ),
                  phoneNumberFormatValid(
                    intl.formatMessage({
                      id: 'EditPartnerBasicInformationForm.phoneNumberValid',
                    }),
                  ),
                )}
                required
              />
              {!partnerListingRef && (
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
                  validate={composeValidators(
                    required(
                      intl.formatMessage({
                        id: 'EditPartnerBasicInformationForm.emailRequired',
                      }),
                    ),
                    emailFormatValid(
                      intl.formatMessage({
                        id: 'EditPartnerBasicInformationForm.emailValid',
                      }),
                    ),
                  )}
                  required
                />
              )}
              {!partnerListingRef && (
                <>
                  <FieldPasswordInput
                    className={css.field}
                    name="password"
                    id="password"
                    placeholder={intl.formatMessage({
                      id: 'EditPartnerForm.passwordPlaceholder',
                    })}
                    label={intl.formatMessage({
                      id: 'EditPartnerForm.passwordLabel',
                    })}
                    shouldHideEyeIcon
                    validate={composeValidators(
                      required(
                        intl.formatMessage({
                          id: 'EditPartnerBasicInformationForm.passwordRequired',
                        }),
                      ),
                      passwordFormatValid(
                        intl.formatMessage({
                          id: 'EditPartnerBasicInformationForm.passwordInvalid',
                        }),
                      ),
                    )}
                    required
                  />
                  <FieldPasswordInput
                    className={css.field}
                    name="confirmPassword"
                    id="confirmPassword"
                    placeholder={intl.formatMessage({
                      id: 'EditPartnerForm.confirmPasswordPlaceholder',
                    })}
                    label={intl.formatMessage({
                      id: 'EditPartnerForm.confirmPasswordLabel',
                    })}
                    shouldHideEyeIcon
                    validate={composeValidatorsWithAllValues(
                      required(
                        intl.formatMessage({
                          id: 'EditPartnerBasicInformationForm.confirmPasswordRequired',
                        }),
                      ),
                      passwordMatchConfirmPassword(
                        intl.formatMessage({
                          id: 'EditPartnerBasicInformationForm.confirmPasswordMatched',
                        }),
                      ),
                    )}
                    required
                  />
                </>
              )}
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
                validate={validURL(
                  intl.formatMessage({
                    id: 'EditPartnerForm.websiteInvalid',
                  }),
                )}
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
                validate={validFacebookUrl(
                  intl.formatMessage({
                    id: 'EditPartnerForm.facebookUrlValid',
                  }),
                )}
              />
              <FieldTextArea
                className={css.field}
                name="description"
                id="description"
                placeholder={intl.formatMessage({
                  id: 'EditPartnerForm.partnerIntroductionPlaceholder',
                })}
                label={intl.formatMessage({
                  id: 'EditPartnerForm.partnerIntroductionLabel',
                })}
                type="textarea"
              />
            </div>

            <div className={css.flexFields}>
              <div className={css.fields}>
                <FieldAvailability
                  values={values}
                  className={css.field}
                  id="availabilityPlan"
                  form={form}
                  name="availabilityPlan"
                />
                <div className={css.retaurantConfigFields}>
                  <p className={css.retaurantConfigLabel}>
                    {intl.formatMessage({
                      id: 'EditPartnerForm.retaurantConfigLabel',
                    })}
                  </p>
                  <Field name="vat" id="vat">
                    {(vatFieldProps: any) => {
                      const { input } = vatFieldProps;
                      return (
                        <ToggleButton
                          className={css.vatButton}
                          id={input.name}
                          name={input.name}
                          label={intl.formatMessage({
                            id: 'EditPartnerForm.exportVat',
                          })}
                          onClick={(e: any) => form.change('vat', e)}
                          defaultValue={input.value}
                        />
                      );
                    }}
                  </Field>
                  <FieldTextInput
                    name="minPrice"
                    className={css.minPrice}
                    id="minPrice"
                    label={intl.formatMessage({
                      id: 'EditPartnerForm.minPrice',
                    })}
                    validate={composeValidators(
                      required(
                        intl.formatMessage({
                          id: 'EditPartnerBasicInformationForm.minPriceRequired',
                        }),
                      ),
                      minPriceLength(
                        intl.formatMessage({
                          id: 'EditPartnerBasicInformationForm.minPriceValid',
                        }),
                        1000,
                      ),
                    )}
                    parse={parsePrice}
                    rightIconContainerClassName={css.inputSuffixed}
                    rightIcon={<div className={css.currency}>đ</div>}
                  />
                  <div className={css.flexField}>
                    <FieldTextInput
                      name="minQuantity"
                      className={css.minQuantity}
                      id="minQuantity"
                      type="number"
                      label={intl.formatMessage({
                        id: 'EditPartnerForm.minQuantityLabel',
                      })}
                      validate={composeValidators(
                        required(
                          intl.formatMessage({
                            id: 'EditPartnerBasicInformationForm.minQuantityRequired',
                          }),
                        ),
                        minLength(
                          intl.formatMessage({
                            id: 'EditPartnerBasicInformationForm.minQuantityInvalid',
                          }),
                          1,
                        ),
                      )}
                      rightIconContainerClassName={css.inputSuffixed}
                      rightIcon={<div className={css.currency}>phần</div>}
                    />
                    <FieldTextInput
                      name="maxQuantity"
                      className={css.maxQuantity}
                      id="maxQuantity"
                      type="number"
                      label={intl.formatMessage({
                        id: 'EditPartnerBasicInformationForm.maxQuantityLabel',
                      })}
                      validate={composeValidators(
                        required(
                          intl.formatMessage({
                            id: 'EditPartnerBasicInformationForm.maxQuantityRequired',
                          }),
                        ),
                        minLength(
                          intl.formatMessage({
                            id: 'EditPartnerBasicInformationForm.maxQuantityInvalid',
                          }),
                          1,
                        ),
                      )}
                      rightIconContainerClassName={css.inputSuffixed}
                      rightIcon={<div className={css.currency}>phần</div>}
                    />
                  </div>
                  <p className={css.packagingLabel}>
                    {intl.formatMessage({
                      id: 'EditPartnerBasicInformationForm.packagingLabel',
                    })}
                  </p>
                  <FieldCheckboxGroup
                    id="packaging"
                    name="packaging"
                    options={PACKAGING_OPTIONS}
                  />
                </div>
              </div>
            </div>
            <div className={css.bankAccountWrapper}>
              <p className={css.label}>
                {intl.formatMessage({
                  id: 'EditPartnerBasicInformationForm.bankLabel',
                })}
              </p>
              <p className={css.description}>
                {intl.formatMessage({
                  id: 'EditPartnerBasicInformationForm.bankDescription',
                })}
              </p>
              <FieldBankAccounts
                className={css.bankAccountInput}
                name="bankAccounts"
                id="bankAccount"
              />
            </div>
            <div className={css.btnWrapper}>
              <div>
                {formError && <ErrorMessage message={formError.message} />}
              </div>
              <Button
                ready={ready}
                disabled={inProgress}
                inProgress={inProgress}
                className={css.submitButton}>
                {intl.formatMessage({
                  id: partnerListingRef
                    ? 'EditPartnerBasicInfomationForm.updateBtn'
                    : 'EditPartnerBasicInfomationForm.createBtn',
                })}
              </Button>
            </div>
          </Form>
        );
      }}
    />
  );
};

export default EditPartnerBasicInformationForm;
