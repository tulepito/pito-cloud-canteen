import type { PropsWithChildren } from 'react';
import React from 'react';
import { useIntl } from 'react-intl';

import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import UnActiveUserScreen from '@components/UnActiveUserScreen/UnActiveUserScreen';

import { getLayoutBaseOnPermission } from './Guards.helper';
import useActiveCompany from './useActiveCompany';
import useVerifyPermission from './useVerifyPermission';

type TPermissionGuardGuardProps = PropsWithChildren<{}>;

const PermissionGuard: React.FC<TPermissionGuardGuardProps> = (props) => {
  const intl = useIntl();
  const { children } = props;
  const { isIgnoredPermissionCheck, userPermission, isMatchedPermission } =
    useVerifyPermission();
  const { isInactiveCompany } = useActiveCompany();

  const renderComponent = () => {
    if (isIgnoredPermissionCheck) {
      return children;
    }

    if (isInactiveCompany) {
      return <UnActiveUserScreen />;
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
