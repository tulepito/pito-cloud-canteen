import React from 'react';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import PitoLogo from '@components/PitoLogo/PitoLogo';
import { useAppDispatch } from '@hooks/reduxHooks';
import { authThunks } from '@redux/slices/auth.slice';
import { userActions } from '@redux/slices/user.slice';
import { generalPaths } from '@src/paths';

import css from './InActiveUserScreen.module.scss';

const UnActiveUserScreen = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    await dispatch(authThunks.logout());
    await dispatch(userActions.clearCurrentUser());
    router.push(generalPaths.Home);
  };

  return (
    <div className={css.root}>
      <PitoLogo />
      <p>Tài khoản của bạn chưa được kích hoạt</p>
      <Button type="button" onClick={handleLogout}>
        Đăng xuất
      </Button>
    </div>
  );
};

export default UnActiveUserScreen;
