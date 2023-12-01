import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useViewport } from '@hooks/useViewport';

import MembersPage from './Members.page';
import MembersMobilePage from './MembersMobile.page';

export default function CompanyMembersRoute() {
  const { isMobileLayout } = useViewport();

  return (
    <MetaWrapper routeName="CompanyMembersRoute">
      <RenderWhen condition={isMobileLayout}>
        <MembersMobilePage />
        <RenderWhen.False>
          <MembersPage />
        </RenderWhen.False>
      </RenderWhen>
    </MetaWrapper>
  );
}
