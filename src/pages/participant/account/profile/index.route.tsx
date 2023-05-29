import { useRouter } from 'next/router';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import { useAppSelector } from '@hooks/reduxHooks';
import { participantPaths } from '@src/paths';

import ProfileModal from '../components/ProfileModal/ProfileModal';

const AccountPageRoute = () => {
  const router = useRouter();
  const currentUser = useAppSelector((state) => state.user.currentUser);

  const goBack = () => {
    router.push(participantPaths.Account);
  };

  return (
    <MetaWrapper>
      <ProfileModal isOpen={true} onClose={goBack} currentUser={currentUser!} />
    </MetaWrapper>
  );
};

export default AccountPageRoute;
