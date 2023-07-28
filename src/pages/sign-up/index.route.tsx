import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import SignUpPage from './components/SignUp.page';

export default function SignUpRoute() {
  return (
    <MetaWrapper routeName="SignUpRoute">
      <SignUpPage />
    </MetaWrapper>
  );
}
