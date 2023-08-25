import { useRouter } from 'next/router';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import { partnerPaths } from '@src/paths';

import { useFetchPartnerListing } from '../../hooks/useFetchPartnerListing';
import MenuInfoModal from '../components/MenuInfoModal';

const PartnerAccountSettingsRoute = () => {
  const router = useRouter();
  useFetchPartnerListing();

  const handleClose = () => {
    router.push(partnerPaths.AccountSettings);
  };

  return (
    <MetaWrapper routeName="PartnerAccountSettingsRoute">
      <MenuInfoModal isOpen onClose={handleClose} />
    </MetaWrapper>
  );
};

export default PartnerAccountSettingsRoute;
