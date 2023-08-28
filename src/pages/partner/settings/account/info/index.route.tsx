import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import { useFetchPartnerListing } from '../../hooks/useFetchPartnerListing';
import { useNavigateToAccountSettingsPage } from '../../hooks/useNavigateToAccountSettingsPage';

import PartnerAccountSettingsMobilePage from './PartnerAccountSettingsMobile.page';

const PartnerAccountSettingsRoute = () => {
  useFetchPartnerListing();
  useNavigateToAccountSettingsPage();

  return (
    <MetaWrapper routeName="PartnerAccountSettingsRoute">
      <PartnerAccountSettingsMobilePage />
    </MetaWrapper>
  );
};

export default PartnerAccountSettingsRoute;
