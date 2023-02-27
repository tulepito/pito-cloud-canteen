import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import ManageCompanies from './ManageCompanies.page';

export default function AdminManageCompaniesRoute() {
  return (
    <MetaWrapper routeName="AdminManageCompaniesRoute">
      <ManageCompanies />
    </MetaWrapper>
  );
}
