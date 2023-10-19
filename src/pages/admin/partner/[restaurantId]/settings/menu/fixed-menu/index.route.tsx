import React from 'react';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import { EMenuType } from '@utils/enums';

import ManagePartnerMenusPage from '../components/ManagePartnerMenus/ManagePartnerMenus.page';

const AdminManagePartnerFixedMenuRoute: React.FC = () => {
  return (
    <MetaWrapper routeName="AdminManagePartnerFixedMenuRoute">
      <ManagePartnerMenusPage menuType={EMenuType.fixedMenu} />
    </MetaWrapper>
  );
};

export default AdminManagePartnerFixedMenuRoute;
