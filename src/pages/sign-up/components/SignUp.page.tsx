import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { authenticationInProgress, authThunks } from '@redux/slices/auth.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import { isSignupEmailTakenError } from '@utils/errors';
import { splitNameFormFullName } from '@utils/string';
import { FormattedMessage } from 'react-intl';

import EmailVerification from './EmailVerification';
import SignUpForm from './SignUpForm';

const SignUpPage = () => {
  const {
    user: { sendVerificationEmailError, sendVerificationEmailInProgress },
    auth: { signupError },
  } = useAppSelector((state) => state);
  const user = useAppSelector(currentUserSelector);
  const authInprogress = useAppSelector(authenticationInProgress);
  const dispatch = useAppDispatch();

  const currentUserLoaded = !!user.id;
  const name = user?.attributes?.profile?.lastName;
  const { email } = user.attributes;
  const showEmailVerification =
    currentUserLoaded && !user.attributes.emailVerified;

  const signupErrorMessage = isSignupEmailTakenError(signupError) ? (
    <FormattedMessage id="SignUpPage.signupFailedEmailAlreadyTaken" />
  ) : (
    <FormattedMessage id="SignUpPage.signupFailed" />
  );

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
