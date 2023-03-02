import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import CreateCompanyPage from './CreateCompany.page';

export default function AdminCreateCompanyRoute() {
  return (
    <MetaWrapper routeName="AdminCreateCompanyRoute">
      <CreateCompanyPage />
    </MetaWrapper>
  );
}
