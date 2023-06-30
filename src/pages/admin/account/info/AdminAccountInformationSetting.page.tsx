import React, { useMemo, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { adminAccountSettingThunks } from '@redux/slices/adminAccountSetting.slice';
import { NotificationSliceAction } from '@redux/slices/notificationPopup.slice';
import { CurrentUser } from '@src/utils/data';
import type { TCurrentUser } from '@src/utils/types';

import PageHeader from '../components/PageHeader/PageHeader';

import type { TAdminAccountInformationSettingFormValues } from './components/AdminAccountInformationSettingForm/AdminAccountInformationSettingForm';
import AdminAccountInformationSettingForm from './components/AdminAccountInformationSettingForm/AdminAccountInformationSettingForm';

const AdminAccountInformationSettingPage = () => {
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const { updateInProgress, updateError } = useAppSelector(
    (state) => state.adminAccountSetting,
  );
  const [submittedValues, setSubmittedValues] = useState<any>();
  const currentUserGetter = CurrentUser(currentUser as TCurrentUser);

  const { firstName } = currentUserGetter.getProfile();
  const { phoneNumber } = currentUserGetter.getProtectedData();
  const { email } = currentUserGetter.getAttributes();
  const profileImage = {
    imageId: currentUser?.profileImage?.id,
    uploadedImage: currentUser?.profileImage,
  };

  const initialValues = useMemo(
    () => ({
      name: firstName,
      phoneNumber,
      email,
      profileImage,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [email, firstName, phoneNumber, JSON.stringify(profileImage)],
  );

  const dispatch = useAppDispatch();

  const onUpdateAdminAccount = async (
    values: TAdminAccountInformationSettingFormValues,
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { name, phoneNumber, profileImage } = values;
    const updateValues = {
      firstName: name,
      ...(phoneNumber
        ? {
            protectedData: {
              phoneNumber,
            },
          }
        : {}),
      ...(profileImage &&
      profileImage.imageId &&
      currentUser?.profileImage?.id?.uuid !== profileImage.imageId.uuid
        ? { profileImageId: profileImage?.imageId }
        : {}),
    };

    const { payload } = await dispatch(
      adminAccountSettingThunks.updateAdminAccount(updateValues),
    );
    if (payload) {
      setSubmittedValues(values);
      dispatch(
        NotificationSliceAction.triggerSuccessNotification({
          id: new Date().getTime(),
          message: 'AdminAccountSetting.submitSuccess',
        }),
      );
    }
  };

  return (
    <div>
      <PageHeader>
        <span>Thông tin tài khoản</span>
      </PageHeader>
      <AdminAccountInformationSettingForm
        onSubmit={onUpdateAdminAccount}
        currentUser={currentUser}
        initialValues={initialValues}
        inProgress={updateInProgress}
        updateError={updateError}
        submittedValues={submittedValues}
      />
    </div>
  );
};

export default AdminAccountInformationSettingPage;
