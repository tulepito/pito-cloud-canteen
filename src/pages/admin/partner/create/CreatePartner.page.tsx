import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  partnerThunks,
  removeAvatar,
  removeCover,
  resetInitialStates,
} from '@redux/slices/partners.slice';
import { isSignUpEmailTakenError } from '@utils/errors';
import { pickRenderableImages } from '@utils/images';
import type { TObject } from '@utils/types';
import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';

import EditPartnerWizard from '../components/EditPartnerWizard/EditPartnerWizard';

const CreatePartnerPage: React.FC<any> = () => {
  const intl = useIntl();
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
  const onCreateDraftPartner = (body: TObject) =>
    dispatch(partnerThunks.createDraftPartner(body));

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

  useEffect(() => {
    // should reset initial states
    dispatch(resetInitialStates());
  }, [dispatch]);

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
