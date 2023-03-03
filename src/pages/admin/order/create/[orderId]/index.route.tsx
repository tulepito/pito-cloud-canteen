import React from 'react';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import CreateOrderPage from '../CreateOrder.page';

export default function CreateOrderRoute() {
  return (
    <MetaWrapper routeName="CreateOrderRoute">
      <CreateOrderPage />
    </MetaWrapper>
  );
}
