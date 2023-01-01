import Button from '@components/Button/Button';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { authenticationInProgress, authThunks } from '@redux/slices/auth.slice';
import { userActions } from '@redux/slices/user.slice';
import { generalPaths } from '@src/paths';
import { useRouter } from 'next/router';

import css from './index.module.scss';

export default function Home() {
  const inProgress = useAppSelector(authenticationInProgress);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    await dispatch(authThunks.logout());
    await dispatch(userActions.clearCurrentUser());
    router.replace(generalPaths.Home);
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
