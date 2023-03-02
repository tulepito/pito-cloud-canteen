import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import { EMenuTypes } from '@utils/enums';
import React from 'react';

import ManagePartnerMenusPage from '../components/ManagePartnerMenus/ManagePartnerMenus.page';

const AdminManagePartnerFixedMenuRoute: React.FC = () => {
  return (
    <MetaWrapper routeName="AdminManagePartnerFixedMenuRoute">
      <ManagePartnerMenusPage menuType={EMenuTypes.fixedMenu} />
    </MetaWrapper>
  );
};

export default AdminManagePartnerFixedMenuRoute;
