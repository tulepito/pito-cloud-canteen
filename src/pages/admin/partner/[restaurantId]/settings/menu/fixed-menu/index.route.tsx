import { EMenuTypes } from '@utils/enums';
import React from 'react';

import ManagePartnerMenusPage from '../components/ManagePartnerMenus/ManagePartnerMenus.page';

const ManagePartnerFixedMenuRoute = () => {
  return <ManagePartnerMenusPage menuType={EMenuTypes.fixedMenu} />;
};

export default ManagePartnerFixedMenuRoute;
