import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useViewport } from '@hooks/useViewport';

import MembersMobilePage, { MembersTab } from '../members/MembersMobile.page';

import GroupSettingPage from './GroupSetting.page';
import GroupSettingMobile from './GroupSettingMobile';

function CompanyGroupSettingRoute() {
  const { isMobileLayout } = useViewport();

  return (
    <MetaWrapper routeName="CompanyGroupSettingRoute">
      <RenderWhen condition={isMobileLayout}>
        <MembersMobilePage currentPage={MembersTab.GroupList}>
          <GroupSettingMobile />
        </MembersMobilePage>
        <RenderWhen.False>
          <GroupSettingPage />
        </RenderWhen.False>
      </RenderWhen>
    </MetaWrapper>
  );
}

export default CompanyGroupSettingRoute;
