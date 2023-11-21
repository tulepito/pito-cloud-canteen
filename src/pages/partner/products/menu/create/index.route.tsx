/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import isEmpty from 'lodash/isEmpty';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import { parseLocationSearchToObject } from '@helpers/urlHelpers';
import { useAppDispatch } from '@hooks/reduxHooks';

import CreateEditMenuLayout from '../components/CreateEditMenuLayout';
import {
  PartnerManageMenusActions,
  PartnerManageMenusThunks,
} from '../PartnerManageMenus.slice';

const PartnerCreateMenuRoute = () => {
  const dispatch = useAppDispatch();
  const { menuId } = parseLocationSearchToObject();

  useEffect(() => {
    if (!isEmpty(menuId)) {
      dispatch(PartnerManageMenusThunks.loadMenuData({ menuId }));
    }
  }, [menuId]);

  useEffect(() => {
    return () => {
      dispatch(PartnerManageMenusActions.clearLoadedMenuData());
    };
  }, []);

  return (
    <MetaWrapper routeName="PartnerCreateMenuRoute">
      <CreateEditMenuLayout />
    </MetaWrapper>
  );
};

export default PartnerCreateMenuRoute;
