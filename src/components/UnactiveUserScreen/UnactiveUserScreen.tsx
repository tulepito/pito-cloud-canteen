import React from 'react';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import { useAppDispatch } from '@hooks/reduxHooks';
import { authThunks } from '@redux/slices/auth.slice';
import { userActions } from '@redux/slices/user.slice';
import { generalPaths } from '@src/paths';

const UnActiveUserScreen = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    await dispatch(authThunks.logout());
    await dispatch(userActions.clearCurrentUser());
    router.push(generalPaths.Home);
  };

  return (
    <div>
      <p>404 Error</p>
      <Button type="button" onClick={handleLogout}>
        Đăng xuất
      </Button>
    </div>
  );
};

export default UnActiveUserScreen;
