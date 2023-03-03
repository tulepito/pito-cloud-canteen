import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useRouter } from 'next/router';

import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { authenticationInProgress, authThunks } from '@redux/slices/auth.slice';
import { userThunks } from '@redux/slices/user.slice';
import { generalPaths } from '@src/paths';

import type { TSignInFormValues } from './SignInForm';
import SignInForm from './SignInForm';

const SignInPage = () => {
  const authInprogress = useAppSelector(authenticationInProgress);
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

  const handleSubmitSignUp = async (values: TSignInFormValues) => {
    await dispatch(authThunks.login(values));
    await dispatch(userThunks.fetchCurrentUser());
    await dispatch(authThunks.authInfo());
  };

  useEffect(() => {
    if (isAuthenticated) {
      router.push(generalPaths.Home);
    }
  }, [isAuthenticated, router]);

  return (
    <SignInForm
      onSubmit={handleSubmitSignUp}
      errorMessage={signInErrorMessage}
      inProgress={authInprogress}
    />
  );
};
export default SignInPage;
