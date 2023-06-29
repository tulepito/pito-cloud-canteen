import type { PropsWithChildren } from 'react';

import useBoolean from '@hooks/useBoolean';

import PartnerHeader from './PartnerHeader/PartnerHeader';
import PartnerLayoutContent from './PartnerLayoutContent/PartnerLayoutContent';
import PartnerLayoutSidebar from './PartnerLayoutSidebar/PartnerLayoutSidebar';
import PartnerLayoutTopbar from './PartnerLayoutTopbar/PartnerLayoutTopbar';
import PartnerLayoutWrapper from './PartnerLayoutWrapper/PartnerLayoutWrapper';
import AdminSidebar from './PartnerSidebar/PartnerSidebar';

const PartnerLayout: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;
  const {
    value: isMenuOpen,
    setFalse: onCloseMenu,
    toggle: toggleMenuOpen,
  } = useBoolean(false);

  return (
    <PartnerLayoutWrapper>
      <PartnerLayoutTopbar>
        <PartnerHeader onMenuClick={toggleMenuOpen} />
      </PartnerLayoutTopbar>
      <PartnerLayoutSidebar isMenuOpen={isMenuOpen}>
        <AdminSidebar onCloseMenu={onCloseMenu} onMenuClick={toggleMenuOpen} />
      </PartnerLayoutSidebar>
      <PartnerLayoutContent isMenuOpen={isMenuOpen}>
        {children}
      </PartnerLayoutContent>
    </PartnerLayoutWrapper>
  );
};

export default PartnerLayout;
