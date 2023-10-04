import React, { useEffect } from 'react';
import isEmpty from 'lodash/isEmpty';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import { useAppDispatch } from '@hooks/reduxHooks';
import { parseLocationSearchToObject } from '@src/utils/history';

import CreateEditMenuLayout from '../components/CreateEditMenuLayout';
import { PartnerManageMenusThunks } from '../PartnerManageMenus.slice';

const PartnerCreateMenuRoute = () => {
  const dispatch = useAppDispatch();
  const { menuId } = parseLocationSearchToObject();

  useEffect(() => {
    if (!isEmpty(menuId)) {
      dispatch(PartnerManageMenusThunks.loadMenuData({ menuId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuId]);

  return (
    <MetaWrapper routeName="PartnerCreateMenuRoute">
      <CreateEditMenuLayout />
    </MetaWrapper>
  );
};

export default PartnerCreateMenuRoute;
