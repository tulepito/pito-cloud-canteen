import { useCallback } from 'react';
import { useRouter } from 'next/router';

import { removeItem } from '@helpers/localStorageHelpers';
import { OrderListActions } from '@pages/participant/orders/OrderList.slice';
import { authThunks } from '@redux/slices/auth.slice';
import { userActions } from '@redux/slices/user.slice';
import { enGeneralPaths, generalPaths } from '@src/paths';

import { useAppDispatch } from './reduxHooks';

export const useLogout = (options?: { from?: string }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const logoutFn = useCallback(async () => {
    const oneSignalInfo = window.sessionStorage.getItem('oneSignalInfo');
    await dispatch(authThunks.logout(oneSignalInfo!));
    dispatch(userActions.clearCurrentUser());
    dispatch(OrderListActions.logout());
    removeItem('userRole');
    router.push({
      pathname: generalPaths.SignIn,
      query: { from: options?.from || enGeneralPaths.Auth },
    });
  }, [dispatch, options?.from, router]);

  return logoutFn;
};
