import { useRouter } from 'next/router';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import { partnerPaths } from '@src/paths';

import { useFetchPartnerListing } from '../../hooks/useFetchPartnerListing';
import { useNavigateToAccountSettingsPage } from '../../hooks/useNavigateToAccountSettingsPage';
import BankInfoModal from '../components/BankInfoModal';

const PartnerAccountSettingsRoute = () => {
  const router = useRouter();
  useFetchPartnerListing();
  useNavigateToAccountSettingsPage();

  const handleClose = () => {
    router.push(partnerPaths.AccountSettings);
  };

  return (
    <MetaWrapper routeName="PartnerAccountSettingsRoute">
      <BankInfoModal isOpen onClose={handleClose} />
    </MetaWrapper>
  );
};

export default PartnerAccountSettingsRoute;
