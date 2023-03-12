/* eslint-disable react-hooks/rules-of-hooks */
import React, { useMemo } from 'react';
import { useRouter } from 'next/router';

import { adminRoutes } from '@src/paths';
import { EListingStates, OTHER_OPTION } from '@utils/enums';
import { parsePrice } from '@utils/validators';

import EditPartnerBasicInformationForm from '../EditPartnerBasicInformationForm/EditPartnerBasicInformationForm';
import EditPartnerLicenseForm from '../EditPartnerLicenseForm/EditPartnerLicenseForm';
import EditPartnerMenuForm from '../EditPartnerMenuForm/EditPartnerMenuForm';
// eslint-disable-next-line import/no-cycle
import EditPartnerPreviewForm from '../EditPartnerPreviewForm/EditPartnerPreviewForm';
// eslint-disable-next-line import/no-cycle
import {
  BASIC_INFORMATION_TAB,
  LICENSE_TAB,
  MENU_TAB,
  PREVIEW_TAB,
} from '../EditPartnerWizard/EditPartnerWizard';

import {
  createSubmitCreatePartnerValues,
  createSubmitLicenseTabValues,
  createSubmitMenuTabValues,
  createSubmitUpdatePartnerValues,
} from './utils';

const redirectAfterDraftUpdate = (
  id: string,
  tab: string,
  tabs: string[],
  router: any,
  pathname: string,
) => {
  const tabIndex = tabs.findIndex((cur) => cur === tab);
  const nextTab = tabs[tabIndex + 1];

  return router.push(`${pathname}/${id}/edit/?tab=${nextTab}`);
};

const EditPartnerWizardTab = (props: any) => {
  const {
    tab,
    uploadedAvatars,
    uploadedCovers,
    onAvatarUpload,
    onCoverUpload,
    onRemoveAvatar,
    onRemoveCover,
    uploadAvatarError,
    uploadCoverError,
    onUpdatePartnerListing,
    onCreateDraftPartner,
    inProgress,
    formError,
    partnerListingRef,
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
    tabs,
    onPublishDraftPartner,
    onDiscardDraftPartner,
    onSetAuthorized,
    onSetUnsatisfactory,
    goBack,
    uploadingImage,
  } = props;

  const router = useRouter();
  const isDraftFlow =
    partnerListingRef?.attributes?.metadata?.listingState ===
    EListingStates.draft;
  switch (tab) {
    case BASIC_INFORMATION_TAB: {
      const handleBasicInformationTabSubmit = async (values: any) => {
        const submitValues = {
          ...values,
          ...(partnerListingRef ? { id: partnerListingRef.id.uuid } : {}),
          oldImages: partnerListingRef?.images,
          uploadedAvatars,
          uploadedCovers,
        };
        // if has fet listing ref => update() nor create()
        const { payload } = partnerListingRef
          ? await onUpdatePartnerListing(
              createSubmitUpdatePartnerValues(submitValues, partnerListingRef),
            )
          : await onCreateDraftPartner(
              createSubmitCreatePartnerValues(submitValues),
            );

        const listing = !partnerListingRef ? payload?.listing : payload;

        const isDraft =
          listing?.attributes?.metadata?.listingState === EListingStates.draft;

        if (isDraft) {
          return redirectAfterDraftUpdate(
            listing?.id?.uuid,
            tab,
            tabs,
            router,
            adminRoutes.ManagePartners.path,
          );
        }

        return listing;
      };

      return (
        <EditPartnerBasicInformationForm
          onSubmit={handleBasicInformationTabSubmit}
          partnerListingRef={partnerListingRef}
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
          uploadingImage={uploadingImage}
        />
      );
    }
    case LICENSE_TAB: {
      const { businessLicense, foodCertificate, partyInsurance, businessType } =
        partnerListingRef?.attributes?.publicData || {};
      const initialValues = useMemo(() => {
        return {
          businessType: businessType || 'company',
          businessLicense: businessLicense || {
            status: 'no',
          },
          foodCertificate: foodCertificate || {
            status: 'no',
          },
          partyInsurance: partyInsurance || {
            status: 'no',
          },
        };
      }, []);

      const handleLicenseTabSubmit = async (values: any) => {
        const submitValues = {
          ...values,
          ...(partnerListingRef ? { id: partnerListingRef.id.uuid } : {}),
          uploadedBusinessLicense,
          uploadedFoodCertificate,
          uploadedPartyInsurance,
          oldImages: partnerListingRef?.images,
        };
        await onUpdatePartnerListing(
          createSubmitLicenseTabValues(submitValues),
        );
        if (partnerListingRef && isDraftFlow) {
          return redirectAfterDraftUpdate(
            partnerListingRef?.id?.uuid,
            tab,
            tabs,
            router,
            adminRoutes.ManagePartners.path,
          );
        }
      };

      return (
        <EditPartnerLicenseForm
          onSubmit={handleLicenseTabSubmit}
          partnerListingRef={partnerListingRef}
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
          inProgress={inProgress}
          formError={formError}
          initialValues={initialValues}
          goBack={goBack}
          uploadingImage={uploadingImage}
        />
      );
    }

    case MENU_TAB: {
      const handleSubmitMenuTabValues = async (values: any) => {
        await onUpdatePartnerListing(
          createSubmitMenuTabValues(
            {
              ...values,
              id: partnerListingRef?.id?.uuid,
            },
            partnerListingRef,
          ),
        );
        if (partnerListingRef && isDraftFlow) {
          return redirectAfterDraftUpdate(
            partnerListingRef?.id?.uuid,
            tab,
            tabs,
            router,
            adminRoutes.ManagePartners.path,
          );
        }
      };

      const {
        meals,
        categories,
        extraServices,
        hasOutsideMenuAndService,
        categoriesOther,
        extraServicesOther,
      } = partnerListingRef?.attributes?.publicData || {};

      const initialValues = useMemo(() => {
        return {
          meals: meals || [],
          categories: categories
            ? [...categories, ...(categoriesOther ? [OTHER_OPTION] : [])]
            : [],
          extraServices: extraServices
            ? [...extraServices, ...(extraServicesOther ? [OTHER_OPTION] : [])]
            : [],
          hasOutsideMenuAndService: hasOutsideMenuAndService || 'yes',
          categoriesOther,
          extraServicesOther,
        };
      }, []);

      return (
        <EditPartnerMenuForm
          onSubmit={handleSubmitMenuTabValues}
          partnerListingRef={partnerListingRef}
          inProgress={inProgress}
          formError={formError}
          initialValues={initialValues}
          goBack={goBack}
        />
      );
    }

    case PREVIEW_TAB: {
      const { email } = partnerListingRef?.author?.attributes || {};
      const { title, description, availabilityPlan } =
        partnerListingRef?.attributes || {};
      const {
        companyName,
        contactorName,
        vat,
        packaging = [],
        packagingOther,
        minPrice,
        phoneNumber,
        location,
        website,
        facebookLink,
        businessLicense,
        foodCertificate,
        partyInsurance,
        meals,
        hasOutsideMenuAndService,
        categories = [],
        extraServices,
        businessType,
        minQuantity,
        maxQuantity,
      } = partnerListingRef?.attributes?.publicData || {};

      const { bankAccounts = [] } =
        partnerListingRef?.attributes?.privateData || {};

      const { status = [] } = partnerListingRef?.attributes?.metadata || {};

      const { address } = location || {};
      const initialValues = useMemo(() => {
        return {
          title,
          cover: uploadedCovers[0],
          avatar: uploadedAvatars[0],
          companyName: companyName || '-',
          contactorName: contactorName || '-',
          email: email || '-',
          phoneNumber: phoneNumber || '-',
          address: address || '-',
          description: description || '-',
          website: website || '-',
          facebookLink: facebookLink || '-',
          availabilityPlan,
          vat,
          // Add other otion to packaging list to show up the checkbox input in preview tab
          packaging: [...packaging, ...(packagingOther ? [OTHER_OPTION] : [])],
          minPrice: parsePrice(minPrice),
          meals,
          hasOutsideMenuAndService,
          businessLicenseStatus: businessLicense?.status,
          businessLicenseImage: uploadedBusinessLicense?.[0],
          footCertificateStatus: foodCertificate?.status,
          footCertificateImage: uploadedFoodCertificate?.[0],
          partyInsuranceStatus: partyInsurance?.status,
          partyInsuranceImage: uploadedPartyInsurance?.[0],
          categories,
          extraServices,
          bankAccounts,
          packagingOther,
          status,
          businessType: businessType || '-',
          minQuantity,
          maxQuantity,
        };
      }, [JSON.stringify(partnerListingRef)]);

      const handleSubmitPreviewForm = async () => {
        const params = {
          id: partnerListingRef?.author?.id?.uuid,
        };
        const response = await onPublishDraftPartner(params);
        if (!response.error) router.push(adminRoutes.ManagePartners.path);
      };

      const handleDiscardDraftPartner = async () => {
        const params = {
          id: partnerListingRef?.author?.id?.uuid,
        };
        const response = await onDiscardDraftPartner(params);
        if (!response.error) router.push(adminRoutes.ManagePartners.path);
      };

      return (
        <EditPartnerPreviewForm
          inProgress={inProgress}
          formError={formError}
          onSubmit={handleSubmitPreviewForm}
          onDiscard={handleDiscardDraftPartner}
          initialValues={initialValues}
          isDraftFlow={isDraftFlow}
          onSetAuthorized={onSetAuthorized}
          onSetUnsatisfactory={onSetUnsatisfactory}
          partnerListingRef={partnerListingRef}
        />
      );
    }

    default:
      return <></>;
  }
};

export default EditPartnerWizardTab;
