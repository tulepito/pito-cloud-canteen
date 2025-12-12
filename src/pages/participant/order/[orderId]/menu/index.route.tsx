import React from 'react';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import OrderMenuPage from './OrderMenu.page';

const OrderMenuRoute = () => {
  return (
    <MetaWrapper routeName="OrderMenuRoute">
      <OrderMenuPage />
    </MetaWrapper>
  );
};

export default OrderMenuRoute;
