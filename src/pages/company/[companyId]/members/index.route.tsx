import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import MembersPage from './Members.page';

export default function CompanyMembersRoute() {
  return (
    <MetaWrapper routeName="CompanyMembersRoute">
      <MembersPage />
    </MetaWrapper>
  );
}
