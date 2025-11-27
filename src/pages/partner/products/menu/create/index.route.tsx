import React from 'react';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import PartnerMenuWizard from '../components/PartnerMenuWizard/PartnerMenuWizard';

const PartnerCreateMenuRoute = () => {
  return (
    <MetaWrapper routeName="PartnerCreateMenuRoute">
      <PartnerMenuWizard />
    </MetaWrapper>
  );
};

export default PartnerCreateMenuRoute;
