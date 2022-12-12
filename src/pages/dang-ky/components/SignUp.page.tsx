import { authenticationInProgress, authThunks } from '@redux/slices/auth.slice';
import type { AppDispatch, RootState } from '@redux/store';
import { isSignupEmailTakenError } from '@utils/errors';
import { splitNameFormFullName } from '@utils/string';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import SignUpForm from './SignUpForm';

const SignUpPage = () => {
  const appState = useSelector((state: RootState) => state);
  const authInprogress = authenticationInProgress(appState);
  const { signupError } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  const signupErrorMessage = isSignupEmailTakenError(signupError) ? (
    <FormattedMessage id="SignUpPage.signupFailedEmailAlreadyTaken" />
  ) : (
    <FormattedMessage id="SignUpPage.signupFailed" />
  );

  const handleSubmitSignUp = (values: Record<string, any>) => {
    // eslint-disable-next-line unused-imports/no-unused-vars
    const { name, confirmPassword, ...rest } = values;
    const splitName = splitNameFormFullName(name);
    const signUpParams = { ...rest, ...splitName };

    dispatch(authThunks.signUp(signUpParams));
  };

  return (
    <div>
      <SignUpForm
        onSubmit={handleSubmitSignUp}
        inProgress={authInprogress}
        errorMessage={signupError ? signupErrorMessage : undefined}
      />
    </div>
  );
};
export default SignUpPage;
