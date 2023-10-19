import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import EditPartnerPage from './edit/EditPartner.page';

export default function PartnerRoute() {
  return (
    <MetaWrapper routeName="AdminEditPartnerRoute">
      <EditPartnerPage />
    </MetaWrapper>
  );
}
