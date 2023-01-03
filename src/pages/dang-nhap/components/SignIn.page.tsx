import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { authenticationInProgress, authThunks } from '@redux/slices/auth.slice';
import { generalPaths } from '@src/paths';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

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
  ) : undefined;

  const handleSubmitSignUp = (values: Record<string, any>) => {
    const { email, password } = values;

    dispatch(authThunks.login({ email, password }));
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
