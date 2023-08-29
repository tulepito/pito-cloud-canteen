import { useRouter } from 'next/router';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { useViewport } from '@hooks/useViewport';
import { passwordThunks } from '@redux/slices/password.slice';
import { partnerPaths } from '@src/paths';

import type { TChangePasswordFormValues } from './components/ChangePasswordForm';
import ChangePasswordForm from './components/ChangePasswordForm';
import ChangePasswordModal from './components/ChangePasswordModal';

const PartnerChangePasswordRoute = () => {
  const router = useRouter();
  const { isMobileLayout } = useViewport();
  const dispatch = useAppDispatch();
  const changePasswordInProgress = useAppSelector(
    (state) => state.password.changePasswordInProgress,
  );

  const handleClose = () => {
    router.push(partnerPaths.Settings);
  };

  const handleSubmit = async (values: TChangePasswordFormValues) => {
    const { password, newPassword } = values;

    await dispatch(
      passwordThunks.changePassword({
        currentPassword: password,
        newPassword,
      }),
    );
  };

  return (
    <MetaWrapper routeName="PartnerChangePasswordRoute">
      <RenderWhen condition={isMobileLayout}>
        <ChangePasswordModal isOpen onClose={handleClose} />

        <RenderWhen.False>
          <ChangePasswordForm
            onSubmit={handleSubmit}
            inProgress={changePasswordInProgress}
          />
        </RenderWhen.False>
      </RenderWhen>
    </MetaWrapper>
  );
};

export default PartnerChangePasswordRoute;
