import { useRouter } from 'next/router';
import React from 'react';

const OrderManagement = () => {
  const router = useRouter();
  const { orderId } = router.query;
  console.log('orderId', orderId);
  return <div>OrderManagement</div>;
};

export default OrderManagement;
