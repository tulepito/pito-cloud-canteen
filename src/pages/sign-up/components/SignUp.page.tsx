import { FormattedMessage } from 'react-intl';
import last from 'lodash/last';
import { useRouter } from 'next/router';

import PitoLogoV2 from '@components/PitoLogoV2/PitoLogoV2';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { authenticationInProgress, authThunks } from '@redux/slices/auth.slice';
import { currentUserSelector, userThunks } from '@redux/slices/user.slice';
import { isSignUpEmailTakenError } from '@utils/errors';
import { splitNameFormFullName } from '@utils/string';

import EmailVerification from './EmailVerification';
import type { TSignUpFormValues } from './SignUpForm';
import SignUpForm from './SignUpForm';

const BASE_URL = process.env.NEXT_PUBLIC_CANONICAL_URL;

const SignUpPage = () => {
  const {
    user: { sendVerificationEmailError, sendVerificationEmailInProgress },
    auth: { signUpError },
  } = useAppSelector((state) => state);
  const user = useAppSelector(currentUserSelector);
  const authInprogress = useAppSelector(authenticationInProgress);
  const dispatch = useAppDispatch();

  // Extract the email from the invitation link
  const router = useRouter();
  const fullUrl = router.query.from
    ? new URL(`${BASE_URL}${router.query.from}`)
    : null;
  const emailFromIntivation = fullUrl?.searchParams.get('email') ?? '';

  const currentUserLoaded = !!user.id;
  const name =
    user?.attributes?.profile?.firstName &&
    (last(user?.attributes?.profile?.firstName.split(' ')) as string);
  const { email } = user.attributes;
  const showEmailVerification =
    currentUserLoaded && !user.attributes.emailVerified;

  const signUpErrorMessage = isSignUpEmailTakenError(signUpError) ? (
    <FormattedMessage id="SignUpPage.signUpFailedEmailAlreadyTaken" />
  ) : (
    <FormattedMessage id="SignUpPage.signUpFailed" />
  );

  const handleSubmitSignUp = async (values: TSignUpFormValues) => {
    // eslint-disable-next-line unused-imports/no-unused-vars
    const { name: submittedName, confirmPassword, ...rest } = values;
    const splitName = splitNameFormFullName(submittedName);
    const signUpParams = { ...rest, ...splitName };

    await dispatch(authThunks.signUp(signUpParams));
    await dispatch(userThunks.fetchCurrentUser());
    await dispatch(authThunks.authInfo());
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        paddingTop: '40px',
      }}>
      <PitoLogoV2 />

      {showEmailVerification ? (
        <EmailVerification
          name={name}
          email={email}
          inProgress={sendVerificationEmailInProgress}
          sendVerificationEmailError={sendVerificationEmailError}
        />
      ) : (
        <SignUpForm
          initialValues={{ email: emailFromIntivation ?? '' }}
          onSubmit={handleSubmitSignUp}
          inProgress={authInprogress}
          errorMessage={signUpError ? signUpErrorMessage : undefined}
        />
      )}
    </div>
  );
};
export default SignUpPage;
