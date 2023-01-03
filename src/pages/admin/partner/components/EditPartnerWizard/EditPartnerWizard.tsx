import FormWizard from '@components/FormWizard/FormWizard';
import { EListingStates } from '@utils/enums';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';

// eslint-disable-next-line import/no-cycle
import EditPartnerWizardTab from '../EditPartnerWizardTab/EditPartnerWizardTab';
import css from './EditPartnerWizard.module.scss';

export const BASIC_INFORMATION_TAB = 'basic-information';
export const LICENSE_TAB = 'license';
export const MENU_TAB = 'menu';
export const PREVIEW_TAB = 'preview';

export const TABS = [BASIC_INFORMATION_TAB, LICENSE_TAB, MENU_TAB, PREVIEW_TAB];

const tabLabel = (intl: any, tab: string) => {
  let key = null;
  if (tab === BASIC_INFORMATION_TAB) {
    key = 'EditPartnerWizard.tabLabelBasicInformation';
  } else if (tab === LICENSE_TAB) {
    key = 'EditPartnerWizard.tabLabelLicense';
  } else if (tab === MENU_TAB) {
    key = 'EditPartnerWizard.tabLabelMenu';
  } else if (tab === PREVIEW_TAB) {
    key = 'EditPartnerWizard.tabLabelPreview';
  }

  return intl.formatMessage({ id: key });
};

const tabCompleted = (tab: string, listing: any) => {
  const {
    availabilityPlan,
    geolocation,
    title,
    publicData = {},
    privateData = {},
  } = listing?.attributes || {};
  const { images } = listing || {};
  const {
    coverImageId,
    avatarImageId,
    businessLicense,
    foodCertificate,
    partyInsurance,
    hasOutsideMenuAndService,
    meals,
    categories,
    extraServices,
  } = publicData;
  const { bankAccounts } = privateData;
  const basicInformationCompleted = !!(
    coverImageId &&
    avatarImageId &&
    title &&
    availabilityPlan &&
    geolocation &&
    images &&
    bankAccounts &&
    bankAccounts.length > 0
  );
  const licenseTabCompleted = !!(
    businessLicense &&
    foodCertificate &&
    partyInsurance
  );
  const menuTabCompleted = !!(
    hasOutsideMenuAndService &&
    meals &&
    categories &&
    extraServices
  );
  switch (tab) {
    case BASIC_INFORMATION_TAB:
      return basicInformationCompleted;
    case LICENSE_TAB:
      return licenseTabCompleted;
    case MENU_TAB:
      return menuTabCompleted;
    case PREVIEW_TAB:
      return (
        basicInformationCompleted && licenseTabCompleted && menuTabCompleted
      );
    default:
      return false;
  }
};

const tabsActive = (isNew: boolean, listing: any) => {
  return TABS.reduce((acc, tab) => {
    const previousTabIndex = TABS.findIndex((t) => t === tab) - 1;
    const isActive =
      previousTabIndex >= 0
        ? !isNew || tabCompleted(TABS[previousTabIndex], listing)
        : true;
    return { ...acc, [tab]: isActive };
  }, {});
};

const EditPartnerWizard = (props: any) => {
  const {
    uploadedAvatars,
    uploadedCovers,
    onAvatarUpload,
    onCoverUpload,
    onRemoveAvatar,
    onRemoveCover,
    uploadAvatarError,
    uploadCoverError,
    partnerListingRef,
    inProgress,
    formError,
    onCreateDraftPartner,
    onUpdatePartnerListing,
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
    onPublishDraftPartner,
    onDiscardDraftPartner,
  } = props;
  const intl = useIntl();
  const router = useRouter();
  const { query, pathname } = router;
  const { restaurantId } = query;
  const selectedTab = query.tab || BASIC_INFORMATION_TAB;
  const tabLink = (tab: string) => {
    return {
      path: !restaurantId ? pathname : `/admin/partner/${restaurantId}/edit`,
      to: { search: `tab=${tab}` },
    };
  };

  const isNew =
    !partnerListingRef ||
    (partnerListingRef &&
      partnerListingRef?.attributes?.metadata?.listingState ===
        EListingStates.draft);

  const tabsStatus = tabsActive(isNew, partnerListingRef) as any;

  useEffect(() => {
    // If selectedTab is not active, redirect to the beginning of wizard
    if (!tabsStatus[selectedTab as string]) {
      const currentTabIndex = TABS.indexOf(selectedTab as string);
      const nearestActiveTab = TABS.slice(0, currentTabIndex)
        .reverse()
        .find((t) => tabsStatus[t]);

      const id = partnerListingRef?.id?.uuid;

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      !partnerListingRef
        ? router.push(`/admin/partner/create`)
        : router.push(`/admin/partner/${id}/edit?tab=${nearestActiveTab}`);
    }
  }, [tabsStatus, selectedTab, partnerListingRef, router]);

  return (
    <FormWizard formTabNavClassName={css.formWizard}>
      {TABS.map((tab: string) => (
        <EditPartnerWizardTab
          key={tab}
          tab={tab}
          tabs={TABS}
          tabId={`${tab}`}
          tabLabel={tabLabel(intl, tab)}
          tabLinkProps={tabLink(tab)}
          selected={selectedTab === tab}
          uploadedAvatars={uploadedAvatars}
          uploadedCovers={uploadedCovers}
          onAvatarUpload={onAvatarUpload}
          onCoverUpload={onCoverUpload}
          onRemoveCover={onRemoveCover}
          onRemoveAvatar={onRemoveAvatar}
          uploadAvatarError={uploadAvatarError}
          uploadCoverError={uploadCoverError}
          inProgress={inProgress}
          formError={formError}
          partnerListingRef={partnerListingRef}
          onUpdatePartnerListing={onUpdatePartnerListing}
          onCreateDraftPartner={onCreateDraftPartner}
          uploadedBusinessLicense={uploadedBusinessLicense}
          onBusinessLicenseUpload={onBusinessLicenseUpload}
          uploadBusinessLicenseError={uploadBusinessLicenseError}
          onRemoveBusinessLicense={onRemoveBusinessLicense}
          uploadedFoodCertificate={uploadedFoodCertificate}
          onFoodCertificateUpload={onFoodCertificateUpload}
          uploadFoodCertificateError={uploadFoodCertificateError}
          onRemoveFoodCertificate={onRemoveFoodCertificate}
          uploadedPartyInsurance={uploadedPartyInsurance}
          onPartyInsuranceUpload={onPartyInsuranceUpload}
          uploadPartyInsuranceError={uploadPartyInsuranceError}
          onRemovePartyInsurance={onRemovePartyInsurance}
          onPublishDraftPartner={onPublishDraftPartner}
          onDiscardDraftPartner={onDiscardDraftPartner}
        />
      ))}
    </FormWizard>
  );
};

export default EditPartnerWizard;
