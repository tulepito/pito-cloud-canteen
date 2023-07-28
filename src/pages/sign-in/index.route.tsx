import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import SignInPage from './components/SignIn.page';

export default function SignInRoute() {
  return (
    <MetaWrapper routeName="SignInRoute">
      <SignInPage />
    </MetaWrapper>
  );
}
