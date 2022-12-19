import { useAppDispatch, useAppSelector } from '@redux/reduxHooks';
import {
  createPartnerPageThunks,
  removeAvatar,
} from '@redux/slices/CreatePartnerPage.slice';
import React from 'react';

import EditPartnerForm from '../components/EditPartnerForm/EditPartnerForm';

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
    <EditPartnerForm
      onSubmit={() => {}}
      images={uploadedAvatars}
      onAvatarUpload={onAvatarUpload}
      onRemoveAvatar={onRemoveAvatar}
      uploadImageError={uploadAvatarError}
    />
  );
};

export default CreatePartnerPage;
