import React from 'react';
import isEmpty from 'lodash/isEmpty';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import { useAppSelector } from '@hooks/reduxHooks';

import ProductLayout from '../ProductLayout';

import PartnerManageMenusPage from './PartnerManageMenus.page';

const PartnerManageMenusRoute = () => {
  const queryMenusInProgress = useAppSelector(
    (state) => state.PartnerManageMenus.fetchMenusInProgress,
  );
  const menus = useAppSelector((state) => state.PartnerManageMenus.menus);

  const shouldHideAddMenuButton =
    queryMenusInProgress || (!queryMenusInProgress && isEmpty(menus));

  return (
    <MetaWrapper routeName="PartnerManageMenusRoute">
      <ProductLayout
        currentPage="menu"
        shouldHideAddProductButton={shouldHideAddMenuButton}
        handleAddProduct={() => {}}>
        <PartnerManageMenusPage />
      </ProductLayout>
    </MetaWrapper>
  );
};

export default PartnerManageMenusRoute;
