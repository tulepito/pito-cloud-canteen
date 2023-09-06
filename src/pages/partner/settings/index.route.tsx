import { useEffect } from 'react';
import { useRouter } from 'next/router';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import { useViewport } from '@hooks/useViewport';
import { partnerPaths } from '@src/paths';

import PartnerSettingsPage from './PartnerSettings.page';

const PartnerSettingsRoute = () => {
  const router = useRouter();
  const { isMobileLayout } = useViewport();

  useEffect(() => {
    if (!isMobileLayout) {
      router.push(partnerPaths.AccountSettings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobileLayout]);

  return (
    <MetaWrapper routeName="PartnerSettingsRoute">
      <PartnerSettingsPage />
    </MetaWrapper>
  );
};

export default PartnerSettingsRoute;
