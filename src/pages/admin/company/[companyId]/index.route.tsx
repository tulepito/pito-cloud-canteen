import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import CompanyDetailsPage from './CompanyDetails.page';

export default function AdminCompanyDetailsRoute() {
  return (
    <MetaWrapper routeName="AdminCompanyDetailsRoute">
      <CompanyDetailsPage />
    </MetaWrapper>
  );
}
