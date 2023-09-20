import React from 'react';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import EditPartnerPage from '../edit/EditPartner.page';

const PartnerSettingsRoute = () => {
  return (
    <MetaWrapper routeName="PartnerSettingsRoute">
      <EditPartnerPage />
    </MetaWrapper>
  );
};

export default PartnerSettingsRoute;
