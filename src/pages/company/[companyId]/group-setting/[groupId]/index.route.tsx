import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { useViewport } from '@hooks/useViewport';

import GroupDetailPage from './GroupDetail.page';
import GroupDetailMobilePage from './GroupDetailMobile.page';

export default function CompanyGroupDetailRoute() {
  const { isMobileLayout } = useViewport();

  return (
    <MetaWrapper routeName="CompanyGroupDetailRoute">
      <RenderWhen condition={isMobileLayout}>
        <GroupDetailMobilePage />
        <RenderWhen.False>
          <GroupDetailPage />
        </RenderWhen.False>
      </RenderWhen>
    </MetaWrapper>
  );
}
