import React from 'react';
import { useRouter } from 'next/router';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import { partnerPaths } from '@src/paths';

import ProductLayout from '../ProductLayout';

import ManagePartnerFoods from './ManagePartnerFoods.page';

const PartnerManageFoodRoute = () => {
  const router = useRouter();

  const handleAddFood = () => {
    router.push(partnerPaths.CreateFood);
  };

  return (
    <MetaWrapper routeName="PartnerManageFoodRoute">
      <ProductLayout
        currentPage="food"
        shouldHideAddProductButton={false}
        handleAddProduct={handleAddFood}>
        <ManagePartnerFoods />
      </ProductLayout>
    </MetaWrapper>
  );
};

export default PartnerManageFoodRoute;
