import { useRouter } from 'next/router';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import { participantPaths } from '@src/paths';

import ChangePasswordModal from '../components/ChangePasswordModal/ChangePasswordModal';

const AccountPageRoute = () => {
  const router = useRouter();

  const goBack = () => {
    router.push(participantPaths.Account);
  };

  return (
    <MetaWrapper>
      <ChangePasswordModal isOpen={true} onClose={goBack} />
    </MetaWrapper>
  );
};

export default AccountPageRoute;
