import React from 'react';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import OrderDetailPage from './OrderDetail.page';

export default function AdminOrderDetailRoute() {
  return (
    <MetaWrapper routeName="AdminOrderDetailRoute">
      <OrderDetailPage />
    </MetaWrapper>
  );
}
