import React, { useMemo, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { adminAccountSettingThunks } from '@redux/slices/adminAccountSetting.slice';
import { NotificationSliceAction } from '@redux/slices/notificationPopup.slice';
import { CurrentUser } from '@src/utils/data';
import type { TCurrentUser } from '@src/utils/types';

import PageHeader from '../components/PageHeader/PageHeader';

import type { TAdminAccountSettingFormValues } from './AdminAccountSettingForm/AdminAccountSettingForm';
import AdminAccountSettingForm from './AdminAccountSettingForm/AdminAccountSettingForm';

const AdminAccountSettingPage = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const { updateInProgress, updateError } = useAppSelector(
    (state) => state.adminAccountSetting,
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
    const { payload } = await dispatch(
      adminAccountSettingThunks.updateAdminAccount(updateValues),
    );
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
      systemServiceFeePercentage: systemVATPercentage * 100,
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
        inProgress={updateInProgress}
        updateError={updateError}
        submittedValues={submittedValues}
      />
    </div>
  );
};

export default AdminAccountSettingPage;
