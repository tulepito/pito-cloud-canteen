/* eslint-disable react-hooks/exhaustive-deps */
import type { PropsWithChildren } from 'react';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { authThunks } from '@redux/slices/auth.slice';
import { emailVerificationActions } from '@redux/slices/emailVerification.slice';
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

  const { pathname } = router;
  const {
    id: userId,
    attributes: { emailVerified: isUserEmailVerified },
  } = currentUser;

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
    if (isAuthenticated) {
      dispatch(userThunks.fetchCurrentUser(undefined));
      const isVerified = isUserEmailVerified;
      dispatch(emailVerificationActions.updateVerificationState(isVerified));
    }
  }, [isAuthenticated, isUserEmailVerified]);

  useEffect(() => {
    dispatch(SystemAttributesThunks.fetchAttributes());
  }, []);

  // TODO: verify authentication
  useVerifyAuthentication(homePageNavigateCondition);

  return <>{renderComponent()}</>;
};

export default AuthGuard;
