import React from 'react';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import ManagePartnerMenuPage from './ManagePartnerMenu.page';

const PartnerMenuRoute = () => {
  return (
    <MetaWrapper routeName="PartnerMenuRoute">
      <ManagePartnerMenuPage />
    </MetaWrapper>
  );
};

export default PartnerMenuRoute;
