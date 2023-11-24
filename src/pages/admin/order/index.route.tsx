import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import ManageOrdersPage from './ManageOrders.page';

const AdminManageOrdersRoute = () => {
  return (
    <MetaWrapper routeName="AdminManageOrdersRoute">
      <ManageOrdersPage showOrderType />
    </MetaWrapper>
  );
};

export default AdminManageOrdersRoute;
