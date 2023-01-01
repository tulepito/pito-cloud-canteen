import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  createAndEditPartnerPageThunks,
  removeAvatar,
  removeCover,
} from '@redux/slices/CreateAndEditPartnerPage.slice';
import { isSignUpEmailTakenError } from '@utils/errors';
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
  } = useAppSelector((state) => state.CreateAndEditPartnerPage);
  const dispatch = useAppDispatch();

  const onAvatarUpload = (params: any) => {
    return dispatch(createAndEditPartnerPageThunks.requestAvatarUpload(params));
  };
  const onRemoveAvatar = (id: any) => {
    return dispatch(removeAvatar(id));
  };

  const onCoverUpload = (params: any) => {
    return dispatch(createAndEditPartnerPageThunks.requestCoverUpload(params));
  };

  const onRemoveCover = (id: any) => {
    return dispatch(removeCover(id));
  };

  const onCreateDraftPartner = (body: any) =>
    dispatch(createAndEditPartnerPageThunks.createDraftPartner(body));

  const intl = useIntl();

  const formError = createDraftPartnerError
    ? {
        message: isSignUpEmailTakenError(createDraftPartnerError)
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
