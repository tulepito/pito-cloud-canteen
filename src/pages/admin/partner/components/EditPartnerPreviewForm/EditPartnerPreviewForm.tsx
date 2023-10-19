/* eslint-disable import/no-cycle */
import React from 'react';
import { Form as FinalForm } from 'react-final-form';
import { FormattedMessage, useIntl } from 'react-intl';
import classNames from 'classnames';
import arrayMutators from 'final-form-arrays';

import Button from '@components/Button/Button';
import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import Form from '@components/Form/Form';
import FieldCheckboxGroup from '@components/FormFields/FieldCheckboxGroup/FieldCheckboxGroup';
import FieldRadioButton from '@components/FormFields/FieldRadioButton/FieldRadioButton';
import FieldTextInput from '@components/FormFields/FieldTextInput/FieldTextInput';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import NamedLink from '@components/NamedLink/NamedLink';
import ResponsiveImage from '@components/ResponsiveImage/ResponsiveImage';
import { useAppSelector } from '@hooks/reduxHooks';
import {
  BANK_OPTIONS,
  BUSINESS_TYPE_OPTIONS,
  EXTRA_SERVICE_OPTIONS,
  MEAL_OPTIONS,
} from '@src/utils/options';
import {
  EImageVariants,
  EPartnerVATSetting,
  ERestaurantListingStatus,
} from '@utils/enums';

import {
  BASIC_INFORMATION_TAB,
  LICENSE_TAB,
  MENU_TAB,
} from '../EditPartnerWizard/EditPartnerWizard';
import { createAvailabilityPlanInitialValues } from '../EditPartnerWizardTab/utils';

import css from './EditPartnerPreviewForm.module.scss';

const getLabelByKey = (list: any[], key: any) => {
  const item = list?.find((l: any) => l.key === key);

  return item && item.label ? item.label : key;
};

const EditPartnerPreviewForm: React.FC<any> = (props) => {
  const intl = useIntl();

  const packagingOptions = useAppSelector(
    (state) => state.SystemAttributes.packaging,
  );
  const categoryOptions = useAppSelector(
    (state) => state.SystemAttributes.categories,
  );

  return (
    <FinalForm
      {...props}
      mutators={{ ...arrayMutators }}
      render={(fieldRenderProps: any) => {
        const {
          handleSubmit,
          values,
          formError,
          inProgress,
          onDiscard,
          isDraftFlow,
          onSetAuthorized,
          onSetUnsatisfactory,
          partnerListingRef,
        } = fieldRenderProps;
        const {
          cover,
          title,
          avatar,
          companyName,
          contactorName,
          email,
          phoneNumber,
          address,
          description,
          website,
          facebookLink,
          availabilityPlan,
          businessLicenseStatus,
          businessLicenseImage,
          footCertificateStatus,
          footCertificateImage,
          partyInsuranceStatus,
          partyInsuranceImage,
          meals = [],
          categories = [],
          hasOutsideMenuAndService,
          extraServices = [],
          bankAccounts = [],
          status,
          businessType,
        } = values;
        const entries = createAvailabilityPlanInitialValues(availabilityPlan);

        const isUnsatisfactory =
          status === ERestaurantListingStatus.unsatisfactory;
        const isAuthorized = status === ERestaurantListingStatus.authorized;
        const isNew = !status || status === ERestaurantListingStatus.new;

        return (
          <Form onSubmit={handleSubmit}>
            {isDraftFlow ? (
              <div className={css.buttonWrapper}>
                <Button
                  onClick={onDiscard}
                  inProgress={inProgress}
                  disabled={inProgress}
                  type="button"
                  className={css.button}>
                  {intl.formatMessage({ id: 'EditPartnerPreviewForm.discard' })}
                </Button>
                <Button
                  inProgress={inProgress}
                  disabled={inProgress}
                  className={css.button}>
                  {intl.formatMessage({ id: 'EditPartnerPreviewForm.publish' })}
                </Button>
              </div>
            ) : (
              <div className={css.buttonWrapper}>
                {(isNew || isUnsatisfactory) && (
                  <Button
                    type="button"
                    inProgress={inProgress}
                    disabled={inProgress}
                    onClick={onSetAuthorized}
                    className={css.button}>
                    <FormattedMessage id="EditPartnerPreviewForm.authorizeBtn" />
                  </Button>
                )}
                {(isNew || isAuthorized) && (
                  <Button
                    type="button"
                    inProgress={inProgress}
                    disabled={inProgress}
                    onClick={onSetUnsatisfactory}
                    className={css.button}>
                    <FormattedMessage id="EditPartnerPreviewForm.unsatisfactoryBtn" />
                  </Button>
                )}
                {!isAuthorized && (
                  <Button
                    type="button"
                    inProgress={inProgress}
                    disabled={inProgress}
                    onClick={onDiscard}
                    className={css.button}>
                    <FormattedMessage id="EditPartnerPreviewForm.deleteBtn" />
                  </Button>
                )}
              </div>
            )}
            {formError && <ErrorMessage message={formError.message} />}
            <div
              className={classNames(css.basicInformationSection, css.section)}>
              <p className={css.sectionLabel}>
                {intl.formatMessage({
                  id: 'EditPartnerForm.basicInformationLabel',
                })}
                <NamedLink
                  path={`/admin/partner/${partnerListingRef?.id?.uuid}/edit`}
                  to={{ search: `tab=${BASIC_INFORMATION_TAB}` }}>
                  <IconEdit className={css.editIcon} />
                </NamedLink>
              </p>
              <div className={css.mediaWrapper}>
                <p className={css.sectionLabel}>
                  {intl.formatMessage({
                    id: 'EditPartnerForm.mediaLabel',
                  })}
                </p>
                <div className={css.previewCover}>
                  <ResponsiveImage
                    variants={[EImageVariants.scaledLarge]}
                    alt={title}
                    image={cover}
                  />
                </div>
                <div className={css.previewAvatar}>
                  <ResponsiveImage
                    variants={[EImageVariants.scaledSmall]}
                    alt={title}
                    image={avatar}
                  />
                </div>
              </div>
              <div className={css.basicInforWrapper}>
                <div className={css.field}>
                  <p className={css.label}>
                    {intl.formatMessage({
                      id: 'EditPartnerPreviewForm.title',
                    })}
                  </p>
                  <p className={css.content}>{title}</p>
                </div>
                <div className={css.field}>
                  <p className={css.label}>
                    {intl.formatMessage({
                      id: 'EditPartnerPreviewForm.companyName',
                    })}
                  </p>
                  <p className={css.content}>{companyName}</p>
                </div>
                <div className={css.field}>
                  <p className={css.label}>
                    {intl.formatMessage({
                      id: 'EditPartnerPreviewForm.contactorName',
                    })}
                  </p>
                  <p className={css.content}>{contactorName}</p>
                </div>

                <div className={css.field}>
                  <p className={css.label}>
                    {intl.formatMessage({
                      id: 'EditPartnerPreviewForm.email',
                    })}
                  </p>
                  <p className={css.content}>{email}</p>
                </div>
                <div className={css.field}>
                  <p className={css.label}>
                    {intl.formatMessage({
                      id: 'EditPartnerPreviewForm.phone',
                    })}
                  </p>
                  <p className={css.content}>{phoneNumber}</p>
                </div>
                <div className={css.field}>
                  <p className={css.label}>
                    {intl.formatMessage({
                      id: 'EditPartnerPreviewForm.location',
                    })}
                  </p>
                  <p className={css.content}>{address}</p>
                </div>
                <div className={css.field}>
                  <p className={css.label}>
                    {intl.formatMessage({
                      id: 'EditPartnerPreviewForm.website',
                    })}
                  </p>
                  <p className={css.content}>{website}</p>
                </div>
                <div className={css.field}>
                  <p className={css.label}>
                    {intl.formatMessage({
                      id: 'EditPartnerPreviewForm.facebookLink',
                    })}
                  </p>
                  <p className={css.content}>{facebookLink}</p>
                </div>
                <div className={css.field}>
                  <p className={css.label}>
                    {intl.formatMessage({
                      id: 'EditPartnerPreviewForm.description',
                    })}
                  </p>
                  <p className={css.content}>{description}</p>
                </div>
              </div>
              <div className={css.configFields}>
                <div className={css.configField}>
                  <div className={css.field}>
                    <div className={css.configLabel}>
                      {intl.formatMessage({
                        id: 'EditPartnerPreviewForm.availablePlan',
                      })}
                    </div>
                    <table
                      className={classNames(css.field, css.availabilityTable)}>
                      <thead>
                        <tr>
                          <th>
                            {intl.formatMessage({
                              id: 'EditPartnerPreviewForm.day',
                            })}
                          </th>
                          <th>
                            {intl.formatMessage({
                              id: 'EditPartnerPreviewForm.time',
                            })}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(entries).map((day: any) => {
                          const isEntries = Array.isArray(entries[day]);

                          return isEntries ? (
                            entries[day]?.map((e: any, eIndx: number) => (
                              <tr key={`${e.startTime}.${eIndx}`}>
                                {eIndx === 0 && (
                                  <td rowSpan={entries[day].length}>
                                    {intl.formatMessage({
                                      id: `FieldAvailability.${day}Label`,
                                    })}
                                  </td>
                                )}
                                <td>
                                  {e.startTime} - {e.endTime}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <></>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className={classNames(css.field, css.restaurantConfig)}>
                    <div className={css.configLabel}>
                      {intl.formatMessage({
                        id: 'EditPartnerForm.retaurantConfigLabel',
                      })}
                    </div>
                    <div className={css.vatContainer}>
                      <FieldRadioButton
                        name="vat"
                        id="vat.exportVat"
                        value={EPartnerVATSetting.vat}
                        label={intl.formatMessage({
                          id: 'EditPartnerForm.exportVat',
                        })}
                        className={css.vatField}
                        disabled
                      />
                      <FieldRadioButton
                        name="vat"
                        id="vat.noExportVat"
                        value={EPartnerVATSetting.noExportVat}
                        label={intl.formatMessage({
                          id: 'EditPartnerForm.noExportVat',
                        })}
                        className={css.vatField}
                        disabled
                      />
                      <FieldRadioButton
                        name="vat"
                        id="vat.direct"
                        value={EPartnerVATSetting.direct}
                        label={intl.formatMessage({
                          id: 'EditPartnerForm.direct',
                        })}
                        className={css.vatField}
                        disabled
                      />
                    </div>
                    <FieldTextInput
                      name="minPrice"
                      className={css.minPrice}
                      id="minPrice"
                      label={intl.formatMessage({
                        id: 'EditPartnerForm.minPrice',
                      })}
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
                        rightIconContainerClassName={css.inputSuffixed}
                        rightIcon={<div className={css.currency}>phần</div>}
                      />
                    </div>
                    <div>
                      <div className={css.label}>
                        {intl.formatMessage({
                          id: 'EditPartnerPreviewForm.packagingLabel',
                        })}
                      </div>
                      <FieldCheckboxGroup
                        id="packaging"
                        name="packaging"
                        disabled
                        options={packagingOptions}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={classNames(css.licenseSection, css.section)}>
              <p className={css.sectionLabel}>
                {intl.formatMessage({
                  id: 'EditPartnerForm.licenseLabel',
                })}
                <NamedLink
                  path={`/admin/partner/${partnerListingRef?.id?.uuid}/edit`}
                  to={{ search: `tab=${LICENSE_TAB}` }}>
                  <IconEdit className={css.editIcon} />
                </NamedLink>
              </p>
              <div className={css.licenseWrapper}>
                <div className={css.box}>
                  <p className={css.label}>
                    {intl.formatMessage({
                      id: 'EditPartnerForm.businessLicense',
                    })}
                  </p>
                  <p>
                    {intl.formatMessage({
                      id: `EditPartnerForm.${businessLicenseStatus}`,
                    })}
                  </p>
                  {businessLicenseImage && (
                    <div className={css.licenseImage}>
                      <ResponsiveImage
                        variants={[EImageVariants.scaledLarge]}
                        alt={title}
                        image={businessLicenseImage}
                      />
                    </div>
                  )}
                </div>
                <div className={css.box}>
                  <p className={css.label}>
                    {intl.formatMessage({
                      id: 'EditPartnerForm.foodCertificate',
                    })}
                  </p>
                  <p>
                    {intl.formatMessage({
                      id: `EditPartnerForm.${footCertificateStatus}`,
                    })}
                  </p>
                  {footCertificateImage && (
                    <div className={css.licenseImage}>
                      <ResponsiveImage
                        variants={[EImageVariants.scaledLarge]}
                        alt={title}
                        image={footCertificateImage}
                      />
                    </div>
                  )}
                </div>
                <div className={css.box}>
                  <p className={css.label}>
                    {intl.formatMessage({
                      id: 'EditPartnerForm.partyInsurance',
                    })}
                  </p>
                  <p>
                    {intl.formatMessage({
                      id: `EditPartnerForm.${partyInsuranceStatus}`,
                    })}
                  </p>
                  {partyInsuranceImage && (
                    <div className={css.licenseImage}>
                      <ResponsiveImage
                        variants={[EImageVariants.scaledLarge]}
                        alt={title}
                        image={partyInsuranceImage}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className={css.label}>
                  {intl.formatMessage({
                    id: 'EditPartnerForm.businessTypeLabel',
                  })}
                </p>
                <p>{getLabelByKey(BUSINESS_TYPE_OPTIONS, businessType)}</p>
              </div>
            </div>
            <div className={classNames(css.section, css.licenseSection)}>
              <p className={css.sectionLabel}>
                {intl.formatMessage({
                  id: 'EditPartnerForm.menuLabel',
                })}
                <NamedLink
                  path={`/admin/partner/${partnerListingRef?.id?.uuid}/edit`}
                  to={{ search: `tab=${MENU_TAB}` }}>
                  <IconEdit className={css.editIcon} />
                </NamedLink>
              </p>
              <div className={css.licenseWrapper}>
                <div className={css.box}>
                  <p className={css.label}>
                    {intl.formatMessage({
                      id: `EditPartnerPreviewForm.meals`,
                    })}
                  </p>
                  <div className={css.content}>
                    {meals.map((meal: string) => (
                      <div key={meal} className={css.mealBox}>
                        {getLabelByKey(MEAL_OPTIONS, meal)}
                      </div>
                    ))}
                  </div>
                </div>
                <div className={css.box}>
                  <p className={css.label}>
                    {intl.formatMessage({
                      id: `EditPartnerPreviewForm.hasOutsideMenuAndService`,
                    })}
                  </p>
                  <p>
                    {intl.formatMessage({
                      id: `EditPartnerPreviewForm.hasOutsideMenuAndService.${hasOutsideMenuAndService}`,
                    })}
                  </p>
                </div>
                <div className={css.box}>
                  <p className={css.label}>
                    {intl.formatMessage({
                      id: `EditPartnerPreviewForm.categoryLabel`,
                    })}
                  </p>
                  <div className={css.content}>
                    {categories.map((category: string) => (
                      <div key={category} className={css.categoryBox}>
                        {getLabelByKey(categoryOptions, category)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className={classNames(css.section, css.licenseSection)}>
              <p className={css.sectionLabel}>
                {intl.formatMessage({
                  id: 'EditPartnerPreviewForm.serviceLabel',
                })}
                <NamedLink
                  path={`/admin/partner/${partnerListingRef?.id?.uuid}/edit/`}
                  to={{ search: `tab=${MENU_TAB}` }}>
                  <IconEdit className={css.editIcon} />
                </NamedLink>
              </p>
              <div className={css.licenseWrapper}>
                <ul className={css.services}>
                  {extraServices.map((s: string) => (
                    <li key={s}>{getLabelByKey(EXTRA_SERVICE_OPTIONS, s)}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className={classNames(css.section, css.bankAccountSection)}>
              <p className={css.sectionLabel}>
                {intl.formatMessage({
                  id: 'EditPartnerPreviewForm.bankAccountLabel',
                })}
                <NamedLink
                  path={`/admin/partner/${partnerListingRef?.id?.uuid}/edit/`}
                  to={{ search: `tab=${BASIC_INFORMATION_TAB}` }}>
                  <IconEdit className={css.editIcon} />
                </NamedLink>
              </p>
              <div className={css.licenseWrapper}>
                <div className={css.bankAccounts}>
                  {bankAccounts.map((bank: any) => {
                    return (
                      <div key={bank.bankId} className={css.bankItem}>
                        <div className={css.right}>
                          <p className={css.label}>
                            {intl.formatMessage({
                              id: 'EditPartnerPreviewForm.bankAccount.bankOwnerName',
                            })}
                          </p>
                          <p className={css.content}>{bank.bankOwnerName}</p>
                          <p className={css.label}>
                            {intl.formatMessage({
                              id: 'EditPartnerPreviewForm.bankAccount.bankName',
                            })}
                          </p>
                          <p className={css.content}>
                            {getLabelByKey(BANK_OPTIONS, bank.bankId)}
                          </p>
                        </div>
                        <div className={css.left}>
                          <p className={css.label}>
                            {intl.formatMessage({
                              id: 'EditPartnerPreviewForm.bankAccount.bankAgency',
                            })}
                          </p>
                          <p className={css.content}>{bank.bankAgency}</p>
                          <p className={css.label}>
                            {intl.formatMessage({
                              id: 'EditPartnerPreviewForm.bankAccount.bankAccountNumber',
                            })}
                          </p>
                          <p className={css.content}>
                            {bank.bankAccountNumber}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Form>
        );
      }}
    />
  );
};

export default EditPartnerPreviewForm;
