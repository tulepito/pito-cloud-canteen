import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import AdminManageClientPaymentsPage from './AdminManageClientPayments.page';

export default function AdminClientPaymentRoute() {
  return (
    <MetaWrapper routeName="AdminManageClientPaymentsRoute">
      <AdminManageClientPaymentsPage />
    </MetaWrapper>
  );
}
