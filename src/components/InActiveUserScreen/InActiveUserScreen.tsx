import React from 'react';
import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import PitoLogo from '@components/PitoLogo/PitoLogo';
import { useLogout } from '@hooks/useLogout';
import { enGeneralPaths } from '@src/paths';

import css from './InActiveUserScreen.module.scss';

const UnActiveUserScreen = () => {
  const handleLogoutFn = useLogout();
  const router = useRouter();

  const handleLogout = async () => {
    await handleLogoutFn();
    router.push(enGeneralPaths.Auth);
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
