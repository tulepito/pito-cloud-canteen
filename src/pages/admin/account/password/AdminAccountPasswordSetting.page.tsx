import React from 'react';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { NotificationSliceAction } from '@redux/slices/notificationPopup.slice';
import { passwordThunks } from '@redux/slices/password.slice';

import PageHeader from '../components/PageHeader/PageHeader';

import type { TAdminAccountResetPasswordFormValues } from './AdminAccountResetPasswordForm/AdminAccountResetPasswordForm';
import AdminAccountResetPasswordForm from './AdminAccountResetPasswordForm/AdminAccountResetPasswordForm';

const AdminAccountPasswordSettingPage = () => {
  const dispatch = useAppDispatch();
  const changePasswordInProgress = useAppSelector(
    (state) => state.password.changePasswordInProgress,
  );
  const changePasswordError = useAppSelector(
    (state) => state.password.changePasswordError,
  );

  const handleSubmit = async ({
    currentPassword,
    newPassword,
  }: TAdminAccountResetPasswordFormValues) => {
    const { payload } = await dispatch(
      passwordThunks.changePassword({
        currentPassword,
        newPassword,
      }),
    );

    if (payload) {
      dispatch(
        NotificationSliceAction.triggerSuccessNotification({
          id: new Date().getTime(),
          message: 'AdminAccountSetting.submitPasswordSuccess',
        }),
      );
    }

    return payload;
  };

  return (
    <div>
      <PageHeader>
        <span>Mật khẩu</span>
      </PageHeader>
      <AdminAccountResetPasswordForm
        inProgress={changePasswordInProgress}
        onSubmit={handleSubmit}
        changePasswordError={changePasswordError}
      />
    </div>
  );
};

export default AdminAccountPasswordSettingPage;
