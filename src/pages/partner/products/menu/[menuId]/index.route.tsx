/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import { useAppDispatch } from '@hooks/reduxHooks';

import CreateEditMenuLayout from '../components/CreateEditMenuLayout';
import {
  PartnerManageMenusActions,
  PartnerManageMenusThunks,
} from '../PartnerManageMenus.slice';

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
  }, [isReady]);

  useEffect(() => {
    return () => {
      dispatch(PartnerManageMenusActions.clearLoadedMenuData());
    };
  }, []);

  return (
    <MetaWrapper routeName="PartnerEditMenuRoute">
      <CreateEditMenuLayout />
    </MetaWrapper>
  );
};

export default PartnerEditMenuRoute;
