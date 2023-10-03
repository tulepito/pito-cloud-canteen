import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import { useAppDispatch } from '@hooks/reduxHooks';

import CreateEditMenuLayout from '../components/CreateEditMenuLayout';
import { PartnerManageMenusThunks } from '../PartnerManageMenus.slice';

const PartnerEditMenuRoute = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    query: { menuId },
    isReady,
  } = router;

  useEffect(() => {
    dispatch(
      PartnerManageMenusThunks.loadMenuData({ menuId: menuId as string }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  return (
    <MetaWrapper routeName="PartnerEditMenuRoute">
      <CreateEditMenuLayout />
    </MetaWrapper>
  );
};

export default PartnerEditMenuRoute;
