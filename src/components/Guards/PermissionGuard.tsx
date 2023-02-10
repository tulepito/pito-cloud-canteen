import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import type { PropsWithChildren } from 'react';
import React from 'react';
import { useIntl } from 'react-intl';

import { getLayoutBaseOnPermission } from './Guards.helper';
import useVerifyPermission from './useVerifyPermission';

type TPermissionGuardGuardProps = PropsWithChildren<{}>;

const PermissionGuard: React.FC<TPermissionGuardGuardProps> = (props) => {
  const intl = useIntl();
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
      <LoadingContainer
        loadingText={intl.formatMessage({ id: 'PermissionGuard.loadingText' })}
      />
    );
  };

  return <>{renderComponent()}</>;
};

export default PermissionGuard;
