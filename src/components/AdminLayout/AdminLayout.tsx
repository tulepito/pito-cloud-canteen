import AdminHeader from '@components/AdminHeader/AdminHeader';
import AdminLayoutContent from '@components/AdminLayoutContent/AdminLayoutContent';
import AdminLayoutSidebar from '@components/AdminLayoutSidebar/AdminLayoutSidebar';
import AdminLayoutTopbar from '@components/AdminLayoutTopbar/AdminLayoutTopbar';
import AdminLayoutWrapper from '@components/AdminLayoutWrapper/AdminLayoutWrapper';
import AdminSidebar from '@components/AdminSidebar/AdminSidebar';
import useBoolean from '@hooks/useBoolean';
import type { PropsWithChildren } from 'react';

const AdminLayout: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;
  const {
    value: isMenuOpen,
    setFalse: onCloseMenu,
    toggle: toggleMenuOpen,
  } = useBoolean(false);

  return (
    <AdminLayoutWrapper>
      <AdminLayoutTopbar>
        <AdminHeader onMenuClick={toggleMenuOpen} />
      </AdminLayoutTopbar>
      <AdminLayoutSidebar isMenuOpen={isMenuOpen}>
        <AdminSidebar onCloseMenu={onCloseMenu} onMenuClick={toggleMenuOpen} />
      </AdminLayoutSidebar>
      <AdminLayoutContent isMenuOpen={isMenuOpen}>
        {children}
      </AdminLayoutContent>
    </AdminLayoutWrapper>
  );
};

export default AdminLayout;
