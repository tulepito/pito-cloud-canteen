import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import { useAppDispatch } from '@hooks/reduxHooks';
import { menusSliceAction } from '@redux/slices/menus.slice';

import EditPartnerMenuWizard from '../components/EditPartnerMenuWizard/EditPartnerMenuWizard';

const AdminCreatePartnerMenuRoute = () => {
  const { duplicateId } = useRouter().query;
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!duplicateId) {
      dispatch(menusSliceAction.setInitialStates());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duplicateId]);

  return (
    <MetaWrapper routeName="AdminCreatePartnerMenuRoute">
      <EditPartnerMenuWizard />;
    </MetaWrapper>
  );
};

export default AdminCreatePartnerMenuRoute;
