import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import React from 'react';

import EditPartnerMenuWizard from '../components/EditPartnerMenuWizard/EditPartnerMenuWizard';

const AdminEditPartnerMenuRoute = () => {
  return (
    <MetaWrapper routeName="AdminEditPartnerMenuRoute">
      <EditPartnerMenuWizard />
    </MetaWrapper>
  );
};

export default AdminEditPartnerMenuRoute;
