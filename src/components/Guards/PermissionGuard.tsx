import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import UnactiveUserScreen from '@components/UnactiveUserScreen/UnactiveUserScreen';
import type { PropsWithChildren } from 'react';
import React from 'react';
import { useIntl } from 'react-intl';

import { getLayoutBaseOnPermission } from './Guards.helper';
import useActiveCompany from './useActiveCompany';
import useVerifyPermission from './useVerifyPermission';

type TPermissionGuardGuardProps = PropsWithChildren<{}>;

const PermissionGuard: React.FC<TPermissionGuardGuardProps> = (props) => {
  const intl = useIntl();
  const { children } = props;
  const { isIgnoredPermissionCheck, userPermission, isMatchedPermission } =
    useVerifyPermission();
  const { isCompanyUnactive } = useActiveCompany();

  const renderComponent = () => {
    if (isIgnoredPermissionCheck) {
      return children;
    }

    if (isCompanyUnactive) {
      return <UnactiveUserScreen />;
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
