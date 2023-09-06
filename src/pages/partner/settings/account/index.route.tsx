import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import { useFetchPartnerListing } from '../hooks/useFetchPartnerListing';

import PartnerAccountSettingsPage from './PartnerAccountSettings.page';

const PartnerAccountSettingsRoute = () => {
  useFetchPartnerListing();

  return (
    <MetaWrapper routeName="PartnerAccountSettingsRoute">
      <PartnerAccountSettingsPage />
    </MetaWrapper>
  );
};

export default PartnerAccountSettingsRoute;
