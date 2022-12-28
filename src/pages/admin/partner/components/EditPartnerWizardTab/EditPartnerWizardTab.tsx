/* eslint-disable react-hooks/rules-of-hooks */
import { denormalisedResponseEntities } from '@utils/data';
import { EListingStates, OTHER_OPTION } from '@utils/enums';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';

import EditPartnerBasicInfomationForm from '../EditPartnerBasicInfomationForm/EditPartnerBasicInfomationForm';
import EditPartnerLicenseForm from '../EditPartnerLicenseForm/EditPartnerLicenseForm';
import EditPartnerMenuForm from '../EditPartnerMenuForm/EditPartnerMenuForm';
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

        const listingResponse = !partnerListingRef ? payload?.listing : payload;

        const [listing] = listingResponse
          ? denormalisedResponseEntities(listingResponse)
          : [];
        const isDraft =
          listing?.attributes?.metadata?.listingState === EListingStates.draft;

        if (listingResponse || isDraft) {
          return redirectAfterDraftUpdate(
            listing?.id?.uuid,
            tab,
            tabs,
            router,
            `/admin/partner`,
          );
        }
        return listingResponse;
      };

      return (
        <EditPartnerBasicInfomationForm
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
        />
      );
    }
    case LICENSE_TAB: {
      const { businessLicense, foodCertificate, partyInsurance } =
        partnerListingRef?.attributes?.publicData || {};
      const initialValues = useMemo(() => {
        return {
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
            `/admin/partner`,
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
            `/admin/partner`,
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
        packaging,
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
        categories,
        extraServices,
      } = partnerListingRef?.attributes?.publicData || {};
      const { bankAccounts = [] } =
        partnerListingRef?.attributes?.privateData || {};
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
          minPrice,
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
        };
      }, []);

      const handleSubmitPreviewForm = () => {
        const params = {
          id: partnerListingRef?.author?.id?.uuid,
        };
        return onPublishDraftPartner(params);
      };

      const handleDiscardDraftPartner = () => {
        const params = {
          id: partnerListingRef?.author?.id?.uuid,
        };
        return onDiscardDraftPartner(params);
      };
      return (
        <EditPartnerPreviewForm
          inProgress={inProgress}
          formError={formError}
          onSubmit={handleSubmitPreviewForm}
          onDiscard={handleDiscardDraftPartner}
          initialValues={initialValues}
          isDraftFlow={isDraftFlow}
        />
      );
    }

    default:
      return <></>;
  }
};

export default EditPartnerWizardTab;
