import ErrorMessage from '@components/ErrorMessage/ErrorMessage';
import IconSpinner from '@components/IconSpinner/IconSpinner';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  createAndEditPartnerPageThunks,
  removeAvatar,
  removeBusinessLicense,
  removeCover,
  removeFoodCertificate,
  removePartyInsurance,
} from '@redux/slices/CreateAndEditPartnerPage.slice';
import {
  pickRenderableImagesByProperty,
  pickRenderableLicenseImagesByProperty,
} from '@utils/images';
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
  } = useAppSelector((state) => state.CreateAndEditPartnerPage);
  const dispatch = useAppDispatch();

  const router = useRouter();
  const { query } = router;
  const { restaurantId } = query;
  const onAvatarUpload = (params: any) =>
    dispatch(createAndEditPartnerPageThunks.requestAvatarUpload(params));

  const onRemoveAvatar = (id: any) => {
    return dispatch(removeAvatar(id));
  };

  const onCoverUpload = (params: any) =>
    dispatch(createAndEditPartnerPageThunks.requestCoverUpload(params));

  const onRemoveCover = (id: any) => {
    return dispatch(removeCover(id));
  };

  const onUpdatePartnerListing = (values: any) =>
    dispatch(
      createAndEditPartnerPageThunks.updatePartnerRestaurantListing(values),
    );

  const onBusinessLicenseUpload = (params: any) => {
    return dispatch(
      createAndEditPartnerPageThunks.requestBusinessLicenseUpload(params),
    );
  };

  const onRemoveBusinessLicense = (id: any) => {
    return dispatch(removeBusinessLicense(id));
  };
  const onFoodCertificateUpload = (params: any) => {
    return dispatch(
      createAndEditPartnerPageThunks.requestFoodCertificateUpload(params),
    );
  };

  const onRemoveFoodCertificate = (id: any) => {
    return dispatch(removeFoodCertificate(id));
  };

  const onPartyInsuranceUpload = (params: any) => {
    return dispatch(
      createAndEditPartnerPageThunks.requestPartyInsuranceUpload(params),
    );
  };

  const onRemovePartyInsurance = (id: any) => {
    return dispatch(removePartyInsurance(id));
  };

  const onPublishDraftPartner = (params: any) => {
    return dispatch(createAndEditPartnerPageThunks.publishDraftPartner(params));
  };

  const onDiscardDraftPartner = (params: any) => {
    return dispatch(createAndEditPartnerPageThunks.discardDraftPartner(params));
  };

  useEffect(() => {
    if (!restaurantId) return;
    dispatch(
      createAndEditPartnerPageThunks.showPartnerRestaurantListing(restaurantId),
    );
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
          discardDraftPartnerInProgress
        }
        formError={
          createDraftPartnerError ||
          updatePartnerListingError ||
          publishDraftPartnerError ||
          discardDraftPartnerError
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
      />
    );
  } else {
    content = <></>;
  }

  return content;
};

export default EditPartnerPage;
