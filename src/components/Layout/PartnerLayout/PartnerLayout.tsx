import type { PropsWithChildren } from 'react';
import { useRouter } from 'next/router';

import RenderWhen from '@components/RenderWhen/RenderWhen';
import useBoolean from '@hooks/useBoolean';
import { useViewport } from '@hooks/useViewport';

import PartnerHeader from './PartnerHeader/PartnerHeader';
import PartnerLayoutContent from './PartnerLayoutContent/PartnerLayoutContent';
import PartnerLayoutSidebar from './PartnerLayoutSidebar/PartnerLayoutSidebar';
import PartnerLayoutTopbar from './PartnerLayoutTopbar/PartnerLayoutTopbar';
import PartnerNavBar from './PartnerNavBar/PartnerNavBar';
import PartnerSidebar from './PartnerSidebar/PartnerSidebar';
import {
  shouldShowPartnerHeader,
  shouldShowPartnerNavBar,
} from './partnerLayout.helpers';

import css from './PartnerLayout.module.scss';

const PartnerLayout: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;
  const { pathname } = useRouter();
  const {
    value: isMenuOpen,
    setFalse: onCloseMenu,
    toggle: toggleMenuOpen,
  } = useBoolean(false);
  const { isMobileLayout } = useViewport();

  const showHeaderMaybe = !isMobileLayout || shouldShowPartnerHeader(pathname);
  const showNavBarMaybe = !isMobileLayout || shouldShowPartnerNavBar(pathname);

  if (pathname.includes('scanner')) {
    return <div className="container w-full mx-auto">{children}</div>;
  }

  return (
    <div className={css.root}>
      <div className={css.main}>
        <RenderWhen condition={showHeaderMaybe}>
          <PartnerLayoutTopbar>
            <PartnerHeader onMenuClick={toggleMenuOpen} />
          </PartnerLayoutTopbar>
        </RenderWhen>
        <PartnerLayoutContent
          hideHeader={!showHeaderMaybe}
          hideNavBar={!showNavBarMaybe}
          isMenuOpen={isMenuOpen}>
          {children}
        </PartnerLayoutContent>
      </div>

      <RenderWhen condition={showNavBarMaybe}>
        <PartnerNavBar />
      </RenderWhen>

      <RenderWhen condition={!isMobileLayout}>
        <PartnerLayoutSidebar isMenuOpen={isMenuOpen}>
          <PartnerSidebar
            onCloseMenu={onCloseMenu}
            onMenuClick={toggleMenuOpen}
          />
        </PartnerLayoutSidebar>
      </RenderWhen>
    </div>
  );
};

export default PartnerLayout;
