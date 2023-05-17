import { useRouter } from 'next/router';

import Button from '@components/Button/Button';
import { useAppSelector } from '@hooks/reduxHooks';
import { useLogout } from '@hooks/useLogout';
import { authenticationInProgress } from '@redux/slices/auth.slice';
import { generalPaths } from '@src/paths';

import css from './index.module.scss';

export default function Home() {
  const inProgress = useAppSelector(authenticationInProgress);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const handleLogoutFn = useLogout();

  const handleLogout = async () => {
    await handleLogoutFn();

    router.push(generalPaths.Home);
  };

  return (
    <div className={css.root}>
      <h1>Trang chủ</h1>
      <Button
        onClick={handleLogout}
        inProgress={inProgress}
        disabled={inProgress || !isAuthenticated}>
        Đăng xuất
      </Button>
    </div>
  );
}
