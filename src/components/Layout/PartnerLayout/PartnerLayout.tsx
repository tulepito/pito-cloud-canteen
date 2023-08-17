import type { PropsWithChildren } from 'react';

import RenderWhen from '@components/RenderWhen/RenderWhen';
import useBoolean from '@hooks/useBoolean';
import { useViewport } from '@hooks/useViewport';

import PartnerHeader from './PartnerHeader/PartnerHeader';
import PartnerLayoutContent from './PartnerLayoutContent/PartnerLayoutContent';
import PartnerLayoutSidebar from './PartnerLayoutSidebar/PartnerLayoutSidebar';
import PartnerLayoutTopbar from './PartnerLayoutTopbar/PartnerLayoutTopbar';
import PartnerSidebar from './PartnerSidebar/PartnerSidebar';

import css from './PartnerLayout.module.scss';

const PartnerLayout: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;
  const {
    value: isMenuOpen,
    setFalse: onCloseMenu,
    toggle: toggleMenuOpen,
  } = useBoolean(false);
  const { isMobileLayout } = useViewport();

  return (
    <div className={css.root}>
      <RenderWhen condition={isMobileLayout}>
        <RenderWhen.False>
          <PartnerLayoutSidebar isMenuOpen={isMenuOpen}>
            <PartnerSidebar
              onCloseMenu={onCloseMenu}
              onMenuClick={toggleMenuOpen}
            />
          </PartnerLayoutSidebar>
          <div className={css.main}>
            <PartnerLayoutTopbar>
              <PartnerHeader onMenuClick={toggleMenuOpen} />
            </PartnerLayoutTopbar>
            <PartnerLayoutContent isMenuOpen={isMenuOpen}>
              {children}
            </PartnerLayoutContent>
          </div>
        </RenderWhen.False>
      </RenderWhen>
    </div>
  );
};

export default PartnerLayout;
