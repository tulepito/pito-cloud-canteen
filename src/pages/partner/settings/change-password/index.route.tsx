import { useRouter } from 'next/router';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import { partnerPaths } from '@src/paths';

import ChangePasswordModal from './components/ChangePasswordModal';

const PartnerChangePasswordRoute = () => {
  const router = useRouter();

  const handleClose = () => {
    router.push(partnerPaths.Settings);
  };

  return (
    <MetaWrapper routeName="PartnerChangePasswordRoute">
      <ChangePasswordModal isOpen onClose={handleClose} />
    </MetaWrapper>
  );
};

export default PartnerChangePasswordRoute;
