import Meta from '@components/Layout/Meta';
import React from 'react';
import { useIntl } from 'react-intl';

import CreateOrderPage from './CreateOrder.page';

export default function CreateOrderRoute() {
  const intl = useIntl();
  const title = intl.formatMessage({
    id: 'CreateOrderRoute.title',
  });

  const description = intl.formatMessage({
    id: 'CreateOrderRoute.description',
  });
  return (
    <>
      <Meta title={title} description={description} />
      <CreateOrderPage />
    </>
  );
}
