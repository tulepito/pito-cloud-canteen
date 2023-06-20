import { useCallback } from 'react';
import { useRouter } from 'next/router';

import { authThunks } from '@redux/slices/auth.slice';
import { userActions } from '@redux/slices/user.slice';
import { generalPaths } from '@src/paths';

import { useAppDispatch } from './reduxHooks';

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const logoutFn = useCallback(async () => {
    await router.push(generalPaths.SignIn);
    await dispatch(authThunks.logout());
    await dispatch(userActions.clearCurrentUser());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return logoutFn;
};
