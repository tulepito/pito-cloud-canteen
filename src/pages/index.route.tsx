import Button from '@components/Button/Button';
import { authThunks } from '@redux/slices/auth.slice';
import type { AppDispatch, RootState } from '@redux/store';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import css from './index.module.scss';

export default function Home() {
  const { logoutInProgress, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(authThunks.logout());
  };

  useEffect(() => {
    if (!logoutInProgress && !isAuthenticated) {
      router.push('/dang-nhap');
    }
  }, [logoutInProgress, isAuthenticated]);

  return (
    <div className={css.root}>
      <h1>Trang chủ</h1>
      <Button onClick={handleLogout}>Đăng xuất</Button>
    </div>
  );
}

Home.requireAuth = true;
