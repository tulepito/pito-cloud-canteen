import AuthenticationLayout from '@components/Layout/AuthenticationLayout/AuthenticationLayout';
import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import PasswordRecoveryPage from './components/PasswordRecovery.page';

const PasswordRecoveryRoute = () => {
  return (
    <MetaWrapper>
      <AuthenticationLayout>
        <PasswordRecoveryPage />
      </AuthenticationLayout>
    </MetaWrapper>
  );
};

export default PasswordRecoveryRoute;
