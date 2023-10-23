import React from 'react';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import AdminEditOrderPage from './AdminEditOrder.page';

export default function AdminEditOrderRoute() {
  return (
    <MetaWrapper routeName="AdminEditOrderRoute">
      <AdminEditOrderPage />
    </MetaWrapper>
  );
}
