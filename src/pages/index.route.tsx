import Button from '@components/Button/Button';
import { useAppDispatch, useAppSelector } from '@redux/reduxHooks';
import { authThunks } from '@redux/slices/auth.slice';
import { useRouter } from 'next/router';

import css from './index.module.scss';

export default function Home() {
  const { logoutInProgress } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    await dispatch(authThunks.logout());
    router.push('/');
  };

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
