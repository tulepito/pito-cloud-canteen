import React from 'react';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import EditPartnerPage from './EditPartner.page';

const AdminEditPartnerRoute = () => {
  return (
    <MetaWrapper routeName="AdminEditPartnerRoute">
      <EditPartnerPage />
    </MetaWrapper>
  );
};

export default AdminEditPartnerRoute;
