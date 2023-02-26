import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import React from 'react';

import ManagePartnerFoods from './ManagePartnerFoods.page';

const AdminManageFoodRoute = () => {
  return (
    <MetaWrapper routeName="AdminManageFoodRoute">
      <ManagePartnerFoods />
    </MetaWrapper>
  );
};

export default AdminManageFoodRoute;
