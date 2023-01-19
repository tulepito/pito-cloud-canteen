import useBoolean from '@hooks/useBoolean';
import type { PropsWithChildren } from 'react';

import AdminHeader from './AdminHeader/AdminHeader';
import AdminLayoutContent from './AdminLayoutContent/AdminLayoutContent';
import AdminLayoutSidebar from './AdminLayoutSidebar/AdminLayoutSidebar';
import AdminLayoutTopbar from './AdminLayoutTopbar/AdminLayoutTopbar';
import AdminLayoutWrapper from './AdminLayoutWrapper/AdminLayoutWrapper';
import AdminSidebar from './AdminSidebar/AdminSidebar';

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
