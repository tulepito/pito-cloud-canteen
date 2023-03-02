import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import React from 'react';

import CreateOrderPage from './CreateOrder.page';

export default function CreateOrderRoute() {
  return (
    <MetaWrapper routeName="CreateOrderRoute">
      <CreateOrderPage />
    </MetaWrapper>
  );
}
