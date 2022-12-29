import React from 'react';

import CreateOrderWizard from './components/CreateOrderWizard/CreateOrderWizard';
import CreateOrderPage from './CreateOrder.page';

export default function CreateOrderRoute() {
  return (
    <>
      <CreateOrderWizard />
      <CreateOrderPage />
    </>
  );
}
