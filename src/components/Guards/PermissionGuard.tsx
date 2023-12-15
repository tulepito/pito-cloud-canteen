import type { PropsWithChildren } from 'react';
import React, { useEffect } from 'react';

import InActiveUserScreen from '@components/InActiveUserScreen/InActiveUserScreen';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import RoleSelectModal from '@components/RoleSelectModal/RoleSelectModal';
import { useAppSelector } from '@hooks/reduxHooks';
import { useRoleSelectModalController } from '@hooks/useRoleSelectModalController';
import { EUserSystemPermission } from '@src/utils/enums';

import { getLayoutBaseOnPermission } from './Guards.helper';
import useActiveCompany from './useActiveCompany';
import useVerifyPermission from './useVerifyPermission';

type TPermissionGuardGuardProps = PropsWithChildren<{}>;

const PermissionGuard: React.FC<TPermissionGuardGuardProps> = (props) => {
  const { children } = props;
  const { isIgnoredPermissionCheck, userPermission, isMatchedPermission } =
    useVerifyPermission();
  const { isInactiveCompany } = useActiveCompany();
  const {
    isRoleSelectModalOpen,
    onCloseRoleSelectModal,
    onOpenRoleSelectModal,
  } = useRoleSelectModalController();

  const currentRole = useAppSelector((state) => state.user.currentRole);

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

  useEffect(() => {
    if (!currentRole && userPermission === EUserSystemPermission.company) {
      onOpenRoleSelectModal();
    }
  }, [currentRole, onOpenRoleSelectModal, userPermission]);

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
