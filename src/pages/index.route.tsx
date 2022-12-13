import { authThunks } from '@redux/slices/auth.slice';
import type { AppDispatch, RootState } from '@redux/store';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

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
    <>
      <div>Hello world</div>
      <div>Hello world</div>
      <div>Hello world</div>
      <div>Hello world</div>
      <div>Hello world</div>
      <div>Hello world</div>
      <div>Hello world</div>

      <button onClick={handleLogout}>Đăng xuất</button>
    </>
  );
}

Home.requireAuth = true;
