import { useCallback } from 'react';
import { useRouter } from 'next/router';

import { removeItem } from '@helpers/localStorageHelpers';
import { authThunks } from '@redux/slices/auth.slice';
import { userActions } from '@redux/slices/user.slice';
import { generalPaths } from '@src/paths';

import { useAppDispatch } from './reduxHooks';

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const logoutFn = useCallback(async () => {
    const oneSignalInfo = window.sessionStorage.getItem('oneSignalInfo');
    await dispatch(authThunks.logout(oneSignalInfo!));
    dispatch(userActions.clearCurrentUser());
    removeItem('userRole');
    router.push(generalPaths.SignIn);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return logoutFn;
};
