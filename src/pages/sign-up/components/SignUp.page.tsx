import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { authenticationInProgress, authThunks } from '@redux/slices/auth.slice';
import { currentUserSelector } from '@redux/slices/user.slice';
import { isSignUpEmailTakenError } from '@utils/errors';
import { splitNameFormFullName } from '@utils/string';
import { FormattedMessage } from 'react-intl';

import EmailVerification from './EmailVerification';
import type { TSignUpFormValues } from './SignUpForm';
import SignUpForm from './SignUpForm';

const SignUpPage = () => {
  const {
    user: { sendVerificationEmailError, sendVerificationEmailInProgress },
    auth: { signUpError },
  } = useAppSelector((state) => state);
  const user = useAppSelector(currentUserSelector);
  const authInprogress = useAppSelector(authenticationInProgress);
  const dispatch = useAppDispatch();

  const currentUserLoaded = !!user.id;
  const name = user?.attributes?.profile?.lastName;
  const { email } = user.attributes;
  const showEmailVerification =
    currentUserLoaded && !user.attributes.emailVerified;

  const signUpErrorMessage = isSignUpEmailTakenError(signUpError) ? (
    <FormattedMessage id="SignUpPage.signUpFailedEmailAlreadyTaken" />
  ) : (
    <FormattedMessage id="SignUpPage.signUpFailed" />
  );

  const handleSubmitSignUp = (values: TSignUpFormValues) => {
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
          errorMessage={signUpError ? signUpErrorMessage : undefined}
        />
      )}
    </div>
  );
};
export default SignUpPage;
