import OrderManagement from './OrderManagement';

const OrderManagementRoute = () => {
  return <OrderManagement />;
};

OrderManagementRoute.requireAuth = true;
export default OrderManagementRoute;
