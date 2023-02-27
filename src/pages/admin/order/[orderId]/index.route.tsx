import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import React from 'react';

import CreateOrderPage from '../create/CreateOrder.page';

export default function CreateOrderRoute() {
  return (
    <MetaWrapper routeName="CreateOrderRoute">
      <CreateOrderPage />
    </MetaWrapper>
  );
}
