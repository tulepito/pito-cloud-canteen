import React from 'react';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import PartnerMenuWizard from '../components/PartnerMenuWizard/PartnerMenuWizard';

const PartnerEditMenuRoute = () => {
  return (
    <MetaWrapper routeName="PartnerEditMenuRoute">
      <PartnerMenuWizard />
    </MetaWrapper>
  );
};

export default PartnerEditMenuRoute;
