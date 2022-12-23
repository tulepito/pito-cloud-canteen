import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import {
  createPartnerPageThunks,
  removeAvatar,
} from '@redux/slices/CreatePartnerPage.slice';
import React from 'react';

import EditPartnerBasicInformationForm from '../components/EditPartnerBasicInformationForm/EditPartnerBasicInformationForm';

const CreatePartnerPage: React.FC<any> = () => {
  const { uploadedAvatars, uploadAvatarError } = useAppSelector(
    (state) => state.CreatePartnerPage,
  );
  const dispatch = useAppDispatch();

  const onAvatarUpload = (e: any) => {
    dispatch(createPartnerPageThunks.requestAvatarUpload(e));
  };
  const onRemoveAvatar = (id: any) => {
    dispatch(removeAvatar(id));
  };

  return (
    <EditPartnerBasicInformationForm
      onSubmit={() => {}}
      images={uploadedAvatars}
      onAvatarUpload={onAvatarUpload}
      onRemoveAvatar={onRemoveAvatar}
      uploadImageError={uploadAvatarError}
    />
  );
};

export default CreatePartnerPage;
