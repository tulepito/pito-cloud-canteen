import React, { useEffect } from 'react';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import { useAppDispatch } from '@hooks/reduxHooks';
import { AdminAttributesThunks } from '@pages/admin/Attributes.slice';

import ManagePartnerFoods from './ManagePartnerFoods.page';

const AdminManageFoodRoute = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(AdminAttributesThunks.fetchAttributes());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MetaWrapper routeName="AdminManageFoodRoute">
      <ManagePartnerFoods />
    </MetaWrapper>
  );
};

export default AdminManageFoodRoute;
