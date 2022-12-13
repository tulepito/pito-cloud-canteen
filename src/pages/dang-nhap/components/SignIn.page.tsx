import { authenticationInProgress, authThunks } from '@redux/slices/auth.slice';
import type { AppDispatch, RootState } from '@redux/store';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import SignInForm from './SignInForm';

const SignInPage = () => {
  const appState = useSelector((state: RootState) => state);
  const authInprogress = authenticationInProgress(appState);
  const { loginError, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const signInErrorMessage = loginError ? (
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
      router.push('/');
    }
  }, [isAuthenticated]);

  return (
    <div>
      <SignInForm
        onSubmit={handleSubmitSignUp}
        errorMessage={signInErrorMessage}
        inProgress={authInprogress}
      />
    </div>
  );
};
export default SignInPage;
