import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import EmailVerificationPage from './components/EmailVerification.page';

const EmailVerificationRoute = () => {
  return (
    <MetaWrapper routeName="EmailVerificationRoute">
      <EmailVerificationPage />;
    </MetaWrapper>
  );
};

export default EmailVerificationRoute;
