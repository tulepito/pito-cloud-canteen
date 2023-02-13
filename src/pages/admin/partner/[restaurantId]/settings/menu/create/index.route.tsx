import { useAppDispatch } from '@hooks/reduxHooks';
import { menusSliceAction } from '@redux/slices/menus.slice';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import EditPartnerMenuWizard from '../components/EditPartnerMenuWizard/EditPartnerMenuWizard';

const CreatePartnerMenuRoute = () => {
  const { duplicateId } = useRouter().query;
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!duplicateId) {
      dispatch(menusSliceAction.setInitialStates());
    }
  }, [duplicateId]);
  return <EditPartnerMenuWizard />;
};

export default CreatePartnerMenuRoute;
