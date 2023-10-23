import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import CreatePartnerPage from './CreatePartner.page';

export default function AdminCreatePartnerRoute() {
  return (
    <MetaWrapper routeName="AdminCreatePartnerRoute">
      <CreatePartnerPage />;
    </MetaWrapper>
  );
}
