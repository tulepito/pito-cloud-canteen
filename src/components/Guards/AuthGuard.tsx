/* eslint-disable react-hooks/exhaustive-deps */
import type { PropsWithChildren } from 'react';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import { getItem } from '@helpers/localStorageHelpers';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { authThunks } from '@redux/slices/auth.slice';
import { emailVerificationActions } from '@redux/slices/emailVerification.slice';
import { NotificationThunks } from '@redux/slices/notification.slice';
import { SystemAttributesThunks } from '@redux/slices/systemAttributes.slice';
import { currentUserSelector, userThunks } from '@redux/slices/user.slice';
import { enGeneralPaths, generalPaths } from '@src/paths';

import { usePathChecker } from './Guards.helper';
import useVerifyAuthentication from './useVerifyAuthentication';

type TAuthGuardProps = PropsWithChildren<{}>;

const AuthGuard: React.FC<TAuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, authInfoLoaded } = useAppSelector(
    (state) => state.auth,
  );
  const currentUser = useAppSelector(currentUserSelector);

  const { pathname, query, isReady } = router;
  const {
    id: userId,
    attributes: { emailVerified: isUserEmailVerified },
  } = currentUser;
  const { userRole: userRoleFromQuery } = query;

  const { isIgnoredAuthCheckRoute, isNonRequireAuthenticationRoute } =
    usePathChecker(pathname);

  // TODO: check sign up path and consider showing verification email form or not
  const isSignUpPath =
    pathname === generalPaths.SignUp || pathname === enGeneralPaths.SignUp;
  const shouldShowEmailVerification = !!userId && !isUserEmailVerified;
  const shouldNavigateInSignUpFlow =
    isSignUpPath && !shouldShowEmailVerification;

  // TODO: check home page navigate condition (non-require authentication route)
  const homePageNavigateCondition =
    isAuthenticated &&
    isNonRequireAuthenticationRoute &&
    (!isSignUpPath || shouldNavigateInSignUpFlow);
  const renderComponent = () => {
    if (isIgnoredAuthCheckRoute) {
      return children;
    }

    const loadingCondition =
      !authInfoLoaded ||
      homePageNavigateCondition ||
      (!isNonRequireAuthenticationRoute && !isAuthenticated);

    if (loadingCondition) {
      return <LoadingContainer />;
    }

    return children;
  };

  // TODO: load authentication info
  useEffect(() => {
    dispatch(authThunks.authInfo());
  }, [pathname]);

  // TODO: fetch current user if authenticated
  useEffect(() => {
    if (isAuthenticated && isReady) {
      const userRole = getItem('userRole');
      dispatch(
        userThunks.fetchCurrentUser({
          userRole: userRoleFromQuery || userRole,
        }),
      );
      dispatch(
        emailVerificationActions.updateVerificationState(isUserEmailVerified),
      );
    }
  }, [isAuthenticated, isUserEmailVerified, isReady]);

  useEffect(() => {
    if (isAuthenticated && isReady) {
      dispatch(SystemAttributesThunks.fetchAttributes());
      dispatch(NotificationThunks.fetchNotifications());
    }
  }, [isAuthenticated, isReady]);

  // TODO: verify authentication
  useVerifyAuthentication(homePageNavigateCondition);

  return <>{renderComponent()}</>;
};

export default AuthGuard;
