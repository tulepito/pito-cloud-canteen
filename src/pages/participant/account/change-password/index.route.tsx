import { useRouter } from 'next/router';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';

import ChangePasswordModal from '../components/ChangePasswordModal/ChangePasswordModal';

const AccountPageRoute = () => {
  const router = useRouter();
  const goBack = () => {
    router.back();
  };

  return (
    <MetaWrapper>
      <ChangePasswordModal isOpen={true} onClose={goBack} />
    </MetaWrapper>
  );
};

export default AccountPageRoute;
