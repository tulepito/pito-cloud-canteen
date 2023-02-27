import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import AdminDashboard from './AdminDashboard.page';

export default function AdminHomePageRoute() {
  return (
    <MetaWrapper routeName="AdminHomePageRoute">
      <AdminDashboard />
    </MetaWrapper>
  );
}
