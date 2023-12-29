import { useEffect } from 'react';
import { useRouter } from 'next/router';

import { setItem } from '@helpers/localStorageHelpers';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { userActions } from '@redux/slices/user.slice';
import { EUserRole, EUserSystemPermission } from '@src/utils/enums';

export const useAccessRouteBaseOnRoles = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { pathname } = router;
  const { roles } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (!pathname) return;
    if (roles.length > 1 && pathname.startsWith('/company')) {
      dispatch(userActions.setUserPermission(EUserSystemPermission.company));
      dispatch(userActions.setRole(EUserRole.booker));
      setItem('userRole', EUserRole.booker);
    }
  }, [dispatch, pathname, roles.length]);
};
