import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { useRoleSelectModalController } from '@hooks/useRoleSelectModalController';
import { authenticationInProgress, authThunks } from '@redux/slices/auth.slice';
import { userThunks } from '@redux/slices/user.slice';
import { generalPaths } from '@src/paths';
import { EUserSystemPermission } from '@src/utils/enums';

import type { TSignInFormValues } from './SignInForm';
import SignInForm from './SignInForm';

const SignInPage = () => {
  const authInprogress = useAppSelector(authenticationInProgress);
  const { onOpenRoleSelectModal } = useRoleSelectModalController();
  const currentRole = useAppSelector((state) => state.user.currentRole);
  const userPermission = useAppSelector((state) => state.user.userPermission);
  const { signInError, isAuthenticated } = useAppSelector(
    (state) => state.auth,
  );
  const dispatch = useAppDispatch();
  const router = useRouter();

  const signInErrorMessage = signInError ? (
    <>
      <div>
        <FormattedMessage id="SignInPage.loginFailedText1" />
      </div>
      <div>
        <FormattedMessage id="SignInPage.loginFailedText2" />
      </div>
    </>
  ) : null;

  const handleSubmitSignIn = async (values: TSignInFormValues) => {
    await dispatch(authThunks.login(values));
    await dispatch(userThunks.fetchCurrentUser());
    await dispatch(authThunks.authInfo());
  };

  useEffect(() => {
    if (!currentRole && userPermission === EUserSystemPermission.company) {
      onOpenRoleSelectModal();
    }
  }, [currentRole, onOpenRoleSelectModal, userPermission]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push(generalPaths.Home);
    }
  }, [isAuthenticated, router]);

  return (
    <SignInForm
      onSubmit={handleSubmitSignIn}
      errorMessage={signInErrorMessage}
      inProgress={authInprogress}
    />
  );
};
export default SignInPage;
