import AuthenticationLayout from '@components/Layout/AuthenticationLayout/AuthenticationLayout';
import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import SignInPage from './components/SignIn.page';

export default function SignInRoute() {
  return (
    <MetaWrapper routeName="SignInRoute">
      <AuthenticationLayout>
        <SignInPage />
      </AuthenticationLayout>
    </MetaWrapper>
  );
}
