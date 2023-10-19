import React, { useMemo, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { NotificationSliceAction } from '@redux/slices/notificationPopup.slice';
import { userThunks } from '@redux/slices/user.slice';
import { CurrentUser } from '@src/utils/data';
import type { TCurrentUser } from '@src/utils/types';

import PageHeader from '../components/PageHeader/PageHeader';

import type { TAdminAccountSettingFormValues } from './AdminAccountSettingForm/AdminAccountSettingForm';
import AdminAccountSettingForm from './AdminAccountSettingForm/AdminAccountSettingForm';

const AdminAccountSettingPage = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const updateProfileInProgress = useAppSelector(
    (state) => state.user.updateProfileInProgress,
  );
  const updateProfileError = useAppSelector(
    (state) => state.user.updateProfileError,
  );

  const [submittedValues, setSubmittedValues] = useState<any>();

  const onSubmit = async ({
    systemServiceFeePercentage,
    systemVATPercentage,
  }: TAdminAccountSettingFormValues) => {
    const updateValues = {
      privateData: {
        systemServiceFeePercentage: systemServiceFeePercentage / 100,
        systemVATPercentage: systemVATPercentage / 100,
      },
    };
    const { payload } = await dispatch(userThunks.updateProfile(updateValues));
    if (payload) {
      setSubmittedValues({ systemVATPercentage, systemServiceFeePercentage });
      dispatch(
        NotificationSliceAction.triggerSuccessNotification({
          id: new Date().getTime(),
          message: 'AdminAccountSetting.submitSuccess',
        }),
      );
    }
  };
  const { systemVATPercentage, systemServiceFeePercentage } = CurrentUser(
    currentUser as TCurrentUser,
  ).getPrivateData();
  const initialValues = useMemo(
    () => ({
      systemVATPercentage: systemVATPercentage * 100,
      systemServiceFeePercentage: systemServiceFeePercentage * 100,
    }),
    [systemVATPercentage, systemServiceFeePercentage],
  );

  return (
    <div>
      <PageHeader>
        <span>Cài đặt tài khoản</span>
      </PageHeader>
      <AdminAccountSettingForm
        onSubmit={onSubmit}
        initialValues={initialValues}
        inProgress={updateProfileInProgress}
        updateError={updateProfileError}
        submittedValues={submittedValues}
      />
    </div>
  );
};

export default AdminAccountSettingPage;
