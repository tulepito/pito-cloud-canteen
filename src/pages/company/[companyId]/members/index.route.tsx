import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useViewport } from '@hooks/useViewport';

import CompanyMembersListMobile from './components/CompanyMembersListMobile/CompanyMembersListMobile';
import MembersPage from './Members.page';
import MembersMobilePage, { MembersTab } from './MembersMobile.page';

export default function CompanyMembersRoute() {
  const { isMobileLayout } = useViewport();

  return (
    <MetaWrapper routeName="CompanyMembersRoute">
      <RenderWhen condition={isMobileLayout}>
        <MembersMobilePage currentPage={MembersTab.MembersList}>
          <CompanyMembersListMobile />
        </MembersMobilePage>
        <RenderWhen.False>
          <MembersPage />
        </RenderWhen.False>
      </RenderWhen>
    </MetaWrapper>
  );
}
