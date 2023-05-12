import { useCallback } from 'react';

import { authThunks } from '@redux/slices/auth.slice';
import { userActions } from '@redux/slices/user.slice';

import { useAppDispatch } from './reduxHooks';

export const useLogout = () => {
  const dispatch = useAppDispatch();

  const logoutFn = useCallback(async () => {
    await dispatch(authThunks.logout());
    await dispatch(userActions.clearCurrentUser());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return logoutFn;
};
