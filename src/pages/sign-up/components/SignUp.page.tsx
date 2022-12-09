import { FormattedMessage } from 'react-intl';

import SignUpForm from './SignUpForm';

const SignUpPage = () => {
  return (
    <div>
      <FormattedMessage id="SignUpPage.Title" />
      <SignUpForm onSubmit={() => {}} />
    </div>
  );
};
export default SignUpPage;
