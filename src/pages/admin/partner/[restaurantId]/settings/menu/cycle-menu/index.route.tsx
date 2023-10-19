import React from 'react';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import { EMenuType } from '@utils/enums';

import ManagePartnerMenusPage from '../components/ManagePartnerMenus/ManagePartnerMenus.page';

const AdminManagePartnerCycleMenuRoute = () => {
  return (
    <MetaWrapper routeName="AdminManagePartnerCycleMenuRoute">
      <ManagePartnerMenusPage menuType={EMenuType.cycleMenu} />
    </MetaWrapper>
  );
};

export default AdminManagePartnerCycleMenuRoute;
