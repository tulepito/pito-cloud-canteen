import type { PropsWithChildren } from 'react';
import React from 'react';

import InActiveUserScreen from '@components/InActiveUserScreen/InActiveUserScreen';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import RoleSelectModal from '@components/RoleSelectModal/RoleSelectModal';
import { useRoleSelectModalController } from '@hooks/useRoleSelectModalController';

import { getLayoutBaseOnPermission } from './Guards.helper';
import useActiveCompany from './useActiveCompany';
import useVerifyPermission from './useVerifyPermission';

type TPermissionGuardGuardProps = PropsWithChildren<{}>;

const PermissionGuard: React.FC<TPermissionGuardGuardProps> = (props) => {
  const { children } = props;
  const { isIgnoredPermissionCheck, userPermission, isMatchedPermission } =
    useVerifyPermission();
  const { isInactiveCompany } = useActiveCompany();
  const { isRoleSelectModalOpen, onCloseRoleSelectModal } =
    useRoleSelectModalController();

  const renderComponent = () => {
    if (isIgnoredPermissionCheck) {
      return children;
    }

    if (isInactiveCompany) {
      return <InActiveUserScreen />;
    }

    const LayoutWrapper = getLayoutBaseOnPermission(userPermission);

    return !!isMatchedPermission && isMatchedPermission ? (
      <LayoutWrapper>{children}</LayoutWrapper>
    ) : (
      <LoadingContainer />
    );
  };

  return (
    <>
      {renderComponent()}
      <RoleSelectModal
        isOpen={isRoleSelectModalOpen}
        handleClose={onCloseRoleSelectModal}
      />
    </>
  );
};

export default PermissionGuard;
