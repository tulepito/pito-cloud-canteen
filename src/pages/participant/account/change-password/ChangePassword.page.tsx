import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';

import ConfirmationModal from '@components/ConfirmationModal/ConfirmationModal';
import ParticipantSidebar from '@components/ParticipantLayout/ParticipantSidebar/ParticipantSidebar';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { passwordActions, passwordThunks } from '@redux/slices/password.slice';
import { participantPaths } from '@src/paths';

import type { TChangePasswordFormValues } from '../components/ChangePasswordForm/ChangePasswordForm';
import ChangePasswordForm from '../components/ChangePasswordForm/ChangePasswordForm';
import ChangePasswordModal from '../components/ChangePasswordModal/ChangePasswordModal';

import css from './ChangePassword.module.scss';

const ChangePasswordPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const changePasswordSuccessModalControl = useBoolean();
  const intl = useIntl();

  const changePasswordInProgress = useAppSelector(
    (state) => state.password.changePasswordInProgress,
  );

  useEffect(() => {
    return () => {
      dispatch(passwordActions.clearChangePasswordError());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initialValues = { password: '', newPassword: '', confirmPassword: '' };

  const goBack = () => {
    router.push(participantPaths.Account);
  };
  const handleSubmit = async (values: TChangePasswordFormValues) => {
    const { password, newPassword } = values;
    const { meta } = await dispatch(
      passwordThunks.changePassword({
        currentPassword: password,
        newPassword,
      }),
    );
    if (meta.requestStatus === 'fulfilled') {
      changePasswordSuccessModalControl.setTrue();
    }
  };

  return (
    <div className={css.container}>
      <ParticipantSidebar title={intl.formatMessage({ id: 'tai-khoan' })} />

      <div className={css.desktopView}>
        <ChangePasswordForm
          onSubmit={handleSubmit}
          initialValues={initialValues}
          inProgress={changePasswordInProgress}
        />
      </div>

      <div className={css.mobileView}>
        <ChangePasswordModal
          isOpen={true}
          onClose={goBack}
          handleSubmit={handleSubmit}
          initialValues={initialValues}
        />
      </div>
      <ConfirmationModal
        isPopup
        id="ChangePasswordSuccessModal"
        isOpen={changePasswordSuccessModalControl.value}
        onClose={changePasswordSuccessModalControl.setFalse}
        title={intl.formatMessage({ id: 'thong-bao' })}
        description={intl.formatMessage({ id: 'doi-mat-khau-thanh-cong' })}
        secondForAutoClose={3}
      />
    </div>
  );
};

export default ChangePasswordPage;
