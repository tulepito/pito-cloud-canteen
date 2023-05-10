import React, { useEffect } from 'react';

import { useAppDispatch } from '@hooks/reduxHooks';
import { AdminAttributesThunks } from '@pages/admin/Attributes.slice';

import CreatePartnerFoodPage from './CreatePartnerFood.page';

const CreatePartnerFoodRoute = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(AdminAttributesThunks.fetchAttributes());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <CreatePartnerFoodPage />;
};

export default CreatePartnerFoodRoute;
