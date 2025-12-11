import React from 'react';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import ManagePartnersMenusPage from './ManagePartnersMenus.page';

const PartnerMenuRoute = () => {
  return (
    <MetaWrapper routeName="PartnerMenuRoute">
      <ManagePartnersMenusPage />
    </MetaWrapper>
  );
};

export default PartnerMenuRoute;
