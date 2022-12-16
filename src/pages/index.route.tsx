import Button from '@components/Button/Button';
import { useAppDispatch, useAppSelector } from '@redux/reduxHooks';
import { authThunks } from '@redux/slices/auth.slice';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import css from './index.module.scss';

export default function Home() {
  const { logoutInProgress, isAuthenticated } = useAppSelector(
    (state) => state.auth,
  );
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(authThunks.logout());
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/dang-nhap');
    }
  }, [isAuthenticated]);

  return (
    <div className={css.root}>
      <h1>Trang chủ</h1>
      <Button onClick={handleLogout} inProgress={logoutInProgress}>
        Đăng xuất
      </Button>
    </div>
  );
}

Home.requireAuth = true;
