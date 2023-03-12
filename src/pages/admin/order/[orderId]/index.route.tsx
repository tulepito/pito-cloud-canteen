import React from 'react';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import OrderDetailPage from './OrderDetail.page';

export default function CreateOrderRoute() {
  return (
    <MetaWrapper routeName="CreateOrderRoute">
      <OrderDetailPage />
    </MetaWrapper>
  );
}
