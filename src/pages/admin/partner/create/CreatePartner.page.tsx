import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  partnerThunks,
  removeAvatar,
  removeCover,
} from '@redux/slices/partners.slice';
import { isSignupEmailTakenError } from '@utils/errors';
import { pickRenderableImages } from '@utils/images';
import React from 'react';
import { useIntl } from 'react-intl';

import EditPartnerWizard from '../components/EditPartnerWizard/EditPartnerWizard';

const CreatePartnerPage: React.FC<any> = () => {
  const {
    uploadedAvatars,
    uploadAvatarError,
    uploadedCovers,
    uploadCoverError,
    uploadedAvatarsOrder,
    removedAvatarIds,
    uploadedCoversOrder,
    removedCoverIds,

    createDraftPartnerInProgress,
    createDraftPartnerError,
  } = useAppSelector((state) => state.partners);
  const dispatch = useAppDispatch();

  const onAvatarUpload = (params: any) => {
    return dispatch(partnerThunks.requestAvatarUpload(params));
  };
  const onRemoveAvatar = (id: any) => {
    return dispatch(removeAvatar(id));
  };

  const onCoverUpload = (params: any) => {
    return dispatch(partnerThunks.requestCoverUpload(params));
  };

  const onRemoveCover = (id: any) => {
    return dispatch(removeCover(id));
  };

  const onCreateDraftPartner = (body: any) =>
    dispatch(partnerThunks.createDraftPartner(body));

  const intl = useIntl();

  const formError = createDraftPartnerError
    ? {
        message: isSignupEmailTakenError(createDraftPartnerError)
          ? intl.formatMessage({
              id: 'CreateCompanyPage.createCompanyEmailAlreadyTaken',
            })
          : intl.formatMessage({
              id: 'CreateCompanyPage.createCompanyFailed',
            }),
      }
    : null;

  return (
    <EditPartnerWizard
      uploadedAvatars={pickRenderableImages(
        {},
        uploadedAvatars,
        uploadedAvatarsOrder,
        removedAvatarIds,
      )}
      uploadedCovers={pickRenderableImages(
        {},
        uploadedCovers,
        uploadedCoversOrder,
        removedCoverIds,
      )}
      onAvatarUpload={onAvatarUpload}
      onCoverUpload={onCoverUpload}
      onRemoveCover={onRemoveCover}
      onRemoveAvatar={onRemoveAvatar}
      uploadAvatarError={uploadAvatarError}
      uploadCoverError={uploadCoverError}
      inProgress={createDraftPartnerInProgress}
      formError={formError}
      onCreateDraftPartner={onCreateDraftPartner}
    />
  );
};

export default CreatePartnerPage;
