import React from 'react';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { adminAccountSettingThunks } from '@redux/slices/adminAccountSetting.slice';
import { NotificationSliceAction } from '@redux/slices/notificationPopup.slice';

import PageHeader from '../components/PageHeader/PageHeader';

import type { TAdminAccountResetPasswordFormValues } from './AdminAccountResetPasswordForm/AdminAccountResetPasswordForm';
import AdminAccountResetPasswordForm from './AdminAccountResetPasswordForm/AdminAccountResetPasswordForm';

const AdminAccountPasswordSettingPage = () => {
  const dispatch = useAppDispatch();
  const { changingPassword, changePasswordError } = useAppSelector(
    (state) => state.adminAccountSetting,
  );

  const onSubmit = async ({
    currentPassword,
    newPassword,
  }: TAdminAccountResetPasswordFormValues) => {
    const { payload } = await dispatch(
      adminAccountSettingThunks.adminChangePassword({
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
        inProgress={changingPassword}
        onSubmit={onSubmit}
        changePasswordError={changePasswordError}
      />
    </div>
  );
};

export default AdminAccountPasswordSettingPage;
