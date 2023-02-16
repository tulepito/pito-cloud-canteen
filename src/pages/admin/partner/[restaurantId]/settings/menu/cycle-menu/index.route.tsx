import { EMenuTypes } from '@utils/enums';
import React from 'react';

import ManagePartnerMenusPage from '../components/ManagePartnerMenus/ManagePartnerMenus.page';

const ManagePartnerCycleMenuRoute = () => {
  return <ManagePartnerMenusPage menuType={EMenuTypes.cycleMenu} />;
};

export default ManagePartnerCycleMenuRoute;
