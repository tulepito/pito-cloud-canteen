import React from 'react';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import ProductLayout from '../ProductLayout';

const PartnerManageMenusRoute = () => {
  return (
    <MetaWrapper>
      <ProductLayout
        currentPage="menu"
        handleAddProduct={() => {}}></ProductLayout>
    </MetaWrapper>
  );
};

export default PartnerManageMenusRoute;
