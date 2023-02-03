import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import type { PropsWithChildren } from 'react';
import React from 'react';

import { getLayoutBaseOnPermission } from './Guards.helper';
import useVerifyPermission from './useVerifyPermission';

type TPermissionGuardGuardProps = PropsWithChildren<{}>;

const PermissionGuard: React.FC<TPermissionGuardGuardProps> = (props) => {
  const { children } = props;
  const { isIgnoredPermissionCheck, userPermission, isMatchedPermission } =
    useVerifyPermission();

  const renderComponent = () => {
    if (isIgnoredPermissionCheck) {
      return children;
    }

    const LayoutWrapper = getLayoutBaseOnPermission(userPermission);

    return !!isMatchedPermission && isMatchedPermission ? (
      <LayoutWrapper>{children}</LayoutWrapper>
    ) : (
      <LoadingContainer />
    );
  };

  return <>{renderComponent()}</>;
};

export default PermissionGuard;
