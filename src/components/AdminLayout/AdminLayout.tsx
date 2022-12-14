import AdminHeader from '@components/AdminHeader/AdminHeader';
import AdminLayoutContent from '@components/AdminLayoutContent/AdminLayoutContent';
import AdminLayoutSidebar from '@components/AdminLayoutSidebar/AdminLayoutSidebar';
import AdminLayoutTopbar from '@components/AdminLayoutTopbar/AdminLayoutTopbar';
import AdminLayoutWrapper from '@components/AdminLayoutWrapper/AdminLayoutWrapper';
import AdminSidebar from '@components/AdminSidebar/AdminSidebar';
import type { ReactNode } from 'react';

type TAdminLayout = {
  children: ReactNode;
};

const AdminLayout = (props: TAdminLayout) => {
  const { children } = props;
  return (
    <AdminLayoutWrapper>
      <AdminLayoutTopbar>
        <AdminHeader />
      </AdminLayoutTopbar>
      <AdminLayoutSidebar>
        <AdminSidebar />
      </AdminLayoutSidebar>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminLayoutWrapper>
  );
};

export default AdminLayout;
