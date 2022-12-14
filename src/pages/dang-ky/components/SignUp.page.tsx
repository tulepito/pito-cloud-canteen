import { authenticationInProgress, authThunks } from '@redux/slices/auth.slice';
import type { AppDispatch, RootState } from '@redux/store';
import { ensureCurrentUser } from '@utils/data';
import { isSignupEmailTakenError } from '@utils/errors';
import { splitNameFormFullName } from '@utils/string';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import EmailVerification from './EmailVerification';
import SignUpForm from './SignUpForm';

const SignUpPage = () => {
  const appState = useSelector((state: RootState) => state);
  const authInprogress = authenticationInProgress(appState);
  const { signupError } = useSelector((state: RootState) => state.auth);

  const {
    currentUser,
    sendVerificationEmailError,
    sendVerificationEmailInProgress,
  } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();

  const user = ensureCurrentUser(currentUser);
  const currentUserLoaded = !!user.id;
  const name = user?.attributes?.profile?.firstName;
  const { email } = user.attributes;

  const signupErrorMessage = isSignupEmailTakenError(signupError) ? (
    <FormattedMessage id="SignUpPage.signupFailedEmailAlreadyTaken" />
  ) : (
    <FormattedMessage id="SignUpPage.signupFailed" />
  );

  const showEmailVerification =
    currentUserLoaded && !user.attributes.emailVerified;

  const handleSubmitSignUp = (values: Record<string, any>) => {
    // eslint-disable-next-line unused-imports/no-unused-vars
    const { name: submittedName, confirmPassword, ...rest } = values;
    const splitName = splitNameFormFullName(submittedName);
    const signUpParams = { ...rest, ...splitName };

    dispatch(authThunks.signUp(signUpParams));
  };

  return (
    <div>
      {showEmailVerification ? (
        <EmailVerification
          name={name}
          email={email}
          inProgress={sendVerificationEmailInProgress}
          sendVerificationEmailError={sendVerificationEmailError}
        />
      ) : (
        <SignUpForm
          onSubmit={handleSubmitSignUp}
          inProgress={authInprogress}
          errorMessage={signupError ? signupErrorMessage : undefined}
        />
      )}
    </div>
  );
};
export default SignUpPage;
