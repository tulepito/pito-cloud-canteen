import Order from './Order';

const OrderRoute = () => {
  return <Order />;
};

OrderRoute.requireAuth = true;
export default OrderRoute;
