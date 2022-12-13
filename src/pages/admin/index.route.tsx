import AdminHeader from '@components/AdminHeader/AdminHeader';
import AdminLayoutContent from '@components/AdminLayoutContent/AdminLayoutContent';
import AdminLayoutSidebar from '@components/AdminLayoutSidebar/AdminLayoutSidebar';
import AdminLayoutTopbar from '@components/AdminLayoutTopbar/AdminLayoutTopbar';
import AdminLayoutWrapper from '@components/AdminLayoutWrapper/AdminLayoutWrapper';
import AdminSidebar from '@components/AdminSidebar/AdminSidebar';

import AdminDashboard from './AdminDashboard.page';

export default function Admin() {
  return (
    <AdminLayoutWrapper>
      <AdminLayoutTopbar>
        <AdminHeader />
      </AdminLayoutTopbar>
      <AdminLayoutSidebar>
        <AdminSidebar />
      </AdminLayoutSidebar>
      <AdminLayoutContent>
        <AdminDashboard />
      </AdminLayoutContent>
    </AdminLayoutWrapper>
  );
}
