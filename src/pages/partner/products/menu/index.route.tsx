import React from 'react';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import { useAppSelector } from '@hooks/reduxHooks';
import { partnerPaths } from '@src/paths';

import ProductLayout from '../ProductLayout';

import PartnerManageMenusPage from './PartnerManageMenus.page';

const PartnerManageMenusRoute = () => {
  const router = useRouter();
  const queryMenusInProgress = useAppSelector(
    (state) => state.PartnerManageMenus.fetchMenusInProgress,
  );
  const menus = useAppSelector((state) => state.PartnerManageMenus.menus);

  const shouldHideAddMenuButton =
    queryMenusInProgress || (!queryMenusInProgress && isEmpty(menus));

  const handleNavigateToCreateMenuPage = () => {
    router.push(partnerPaths.CreateMenu);
  };

  return (
    <MetaWrapper routeName="PartnerManageMenusRoute">
      <ProductLayout
        currentPage="menu"
        shouldHideAddProductButton={shouldHideAddMenuButton}
        handleAddProduct={handleNavigateToCreateMenuPage}>
        <PartnerManageMenusPage />
      </ProductLayout>
    </MetaWrapper>
  );
};

export default PartnerManageMenusRoute;
