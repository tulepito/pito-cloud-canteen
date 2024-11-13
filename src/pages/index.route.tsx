import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import HomePage from './index.page';

export default function Home() {
  return (
    <MetaWrapper routeName="HomeRoute">
      <HomePage />
    </MetaWrapper>
  );
}
