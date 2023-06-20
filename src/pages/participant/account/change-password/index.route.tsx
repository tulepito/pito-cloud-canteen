import { useEffect } from 'react';
import { useRouter } from 'next/router';

import MetaWrapper from '@components/MetaWrapper/MetaWrapper';
import { useAppDispatch } from '@hooks/reduxHooks';
import { participantPaths } from '@src/paths';

import { AccountActions } from '../Account.slice';
import ChangePasswordModal from '../components/ChangePasswordModal/ChangePasswordModal';

const ChangePasswordRoute = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const goBack = () => {
    router.push(participantPaths.Account);
  };

  useEffect(() => {
    return () => {
      dispatch(AccountActions.clearChangePasswordError());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MetaWrapper>
      <ChangePasswordModal isOpen={true} onClose={goBack} />
    </MetaWrapper>
  );
};

export default ChangePasswordRoute;
