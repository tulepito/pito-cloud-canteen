import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import IconSpinner from '@components/IconSpinner/IconSpinner';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  partnerThunks,
  removeAvatar,
  removeBusinessLicense,
  removeCover,
  removeFoodCertificate,
  removePartyInsurance,
} from '@redux/slices/partners.slice';
import { ERestaurantListingStatus } from '@utils/enums';
import {
  pickRenderableImagesByProperty,
  pickRenderableLicenseImagesByProperty,
} from '@utils/images';
import type { TObject } from '@utils/types';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import EditPartnerWizard from '../../components/EditPartnerWizard/EditPartnerWizard';
import css from './EditPartner.module.scss';

const EditPartnerPage = () => {
  const {
    uploadedAvatars,
    uploadAvatarError,
    uploadedAvatarsOrder,
    removedAvatarIds,

    uploadCoverError,
    uploadedCoversOrder,
    uploadedCovers,
    removedCoverIds,

    createDraftPartnerInProgress,
    createDraftPartnerError,

    showPartnerListingInProgress,
    showPartnerListingError,
    partnerListingRef,

    updatePartnerListingInProgress,
    updatePartnerListingError,

    uploadedBusinessLicense,
    uploadBusinessLicenseError,
    removedBusinessLicenseIds,
    uploadedBusinessLicensesOrder,

    uploadedFoodCertificate,
    uploadFoodCertificateError,
    removedFoodCertificateIds,
    uploadedFoodCertificatesOrder,

    uploadedPartyInsurance,
    uploadPartyInsuranceError,
    removedPartyInsuranceIds,
    uploadedPartyInsurancesOrder,

    publishDraftPartnerInProgress,
    publishDraftPartnerError,

    discardDraftPartnerInProgress,
    discardDraftPartnerError,

    restaurantTableActionInProgress,
    restaurantTableActionError,
  } = useAppSelector((state) => state.partners);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { query } = router;
  const { restaurantId } = query;

  const onAvatarUpload = (params: TObject) => {
    return dispatch(partnerThunks.requestAvatarUpload(params));
  };
  const onRemoveAvatar = (id: any) => {
    return dispatch(removeAvatar(id));
  };

  const onCoverUpload = (params: TObject) => {
    return dispatch(partnerThunks.requestCoverUpload(params));
  };
  const onRemoveCover = (id: any) => {
    return dispatch(removeCover(id));
  };

  const onUpdatePartnerListing = (values: TObject) => {
    return dispatch(partnerThunks.updatePartnerRestaurantListing(values));
  };

  const onBusinessLicenseUpload = (params: TObject) => {
    return dispatch(partnerThunks.requestBusinessLicenseUpload(params));
  };
  const onRemoveBusinessLicense = (id: any) => {
    return dispatch(removeBusinessLicense(id));
  };

  const onFoodCertificateUpload = (params: TObject) => {
    return dispatch(partnerThunks.requestFoodCertificateUpload(params));
  };
  const onRemoveFoodCertificate = (id: any) => {
    return dispatch(removeFoodCertificate(id));
  };

  const onPartyInsuranceUpload = (params: TObject) => {
    return dispatch(partnerThunks.requestPartyInsuranceUpload(params));
  };
  const onRemovePartyInsurance = (id: any) => {
    return dispatch(removePartyInsurance(id));
  };

  const onPublishDraftPartner = (params: TObject) => {
    return dispatch(partnerThunks.publishDraftPartner(params));
  };
  const onDiscardDraftPartner = (params: TObject) => {
    return dispatch(partnerThunks.discardDraftPartner(params));
  };

  const onSetAuthorized = async () => {
    const params = {
      id: restaurantId,
      status: ERestaurantListingStatus.authorized,
    };
    await dispatch(partnerThunks.setRestaurantStatus(params));
  };

  const onSetUnsatisfactory = async () => {
    const params = {
      id: restaurantId,
      status: ERestaurantListingStatus.unsatisfactory,
    };
    await dispatch(partnerThunks.setRestaurantStatus(params));
  };

  useEffect(() => {
    if (!restaurantId) return;
    dispatch(partnerThunks.showPartnerRestaurantListing(restaurantId));
  }, [restaurantId]);

  let content;
  if (showPartnerListingInProgress) {
    content = (
      <div className={css.loadingContainer}>
        <IconSpinner />
      </div>
    );
  } else if (showPartnerListingError) {
    content = <ErrorMessage message={showPartnerListingError.message} />;
  } else if (partnerListingRef) {
    content = (
      <EditPartnerWizard
        uploadedAvatars={pickRenderableImagesByProperty(
          partnerListingRef,
          uploadedAvatars,
          uploadedAvatarsOrder,
          removedAvatarIds,
          'avatarImageId',
        )}
        uploadedCovers={pickRenderableImagesByProperty(
          partnerListingRef,
          uploadedCovers,
          uploadedCoversOrder,
          removedCoverIds,
          'coverImageId',
        )}
        onAvatarUpload={onAvatarUpload}
        onCoverUpload={onCoverUpload}
        onRemoveCover={onRemoveCover}
        onRemoveAvatar={onRemoveAvatar}
        uploadAvatarError={uploadAvatarError}
        uploadCoverError={uploadCoverError}
        inProgress={
          createDraftPartnerInProgress ||
          updatePartnerListingInProgress ||
          publishDraftPartnerInProgress ||
          discardDraftPartnerInProgress ||
          restaurantTableActionInProgress
        }
        formError={
          createDraftPartnerError ||
          updatePartnerListingError ||
          publishDraftPartnerError ||
          discardDraftPartnerError ||
          restaurantTableActionError
        }
        onDiscardDraftPartner={onDiscardDraftPartner}
        onPublishDraftPartner={onPublishDraftPartner}
        onUpdatePartnerListing={onUpdatePartnerListing}
        partnerListingRef={partnerListingRef}
        uploadedBusinessLicense={pickRenderableLicenseImagesByProperty(
          partnerListingRef,
          uploadedBusinessLicense,
          uploadedBusinessLicensesOrder,
          removedBusinessLicenseIds,
          'businessLicense',
        )}
        onBusinessLicenseUpload={onBusinessLicenseUpload}
        uploadBusinessLicenseError={uploadBusinessLicenseError}
        onRemoveBusinessLicense={onRemoveBusinessLicense}
        uploadedFoodCertificate={pickRenderableLicenseImagesByProperty(
          partnerListingRef,
          uploadedFoodCertificate,
          uploadedFoodCertificatesOrder,
          removedFoodCertificateIds,
          'foodCertificate',
        )}
        onFoodCertificateUpload={onFoodCertificateUpload}
        uploadFoodCertificateError={uploadFoodCertificateError}
        onRemoveFoodCertificate={onRemoveFoodCertificate}
        uploadedPartyInsurance={pickRenderableLicenseImagesByProperty(
          partnerListingRef,
          uploadedPartyInsurance,
          uploadedPartyInsurancesOrder,
          removedPartyInsuranceIds,
          'partyInsurance',
        )}
        onPartyInsuranceUpload={onPartyInsuranceUpload}
        uploadPartyInsuranceError={uploadPartyInsuranceError}
        onRemovePartyInsurance={onRemovePartyInsurance}
        onSetAuthorized={onSetAuthorized}
        onSetUnsatisfactory={onSetUnsatisfactory}
      />
    );
  } else {
    content = <></>;
  }

  return content;
};

export default EditPartnerPage;
