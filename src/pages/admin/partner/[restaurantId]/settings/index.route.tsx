import React, { useEffect } from 'react';

import { useAppDispatch } from '@hooks/reduxHooks';
import { AdminAttributesThunks } from '@pages/admin/Attributes.slice';

import EditPartnerPage from '../edit/EditPartner.page';

const PartnerSettingsRoute = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(AdminAttributesThunks.fetchAttributes());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <EditPartnerPage />;
};

export default PartnerSettingsRoute;
