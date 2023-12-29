import { useCallback } from 'react';

import { userActions } from '@redux/slices/user.slice';

import { useAppDispatch, useAppSelector } from './reduxHooks';

export const useRoleSelectModalController = () => {
  const dispatch = useAppDispatch();
  const isRoleSelectModalOpen = useAppSelector(
    (state) => state.user.isRoleSelectModalOpen,
  );

  const onOpenRoleSelectModal = useCallback(() => {
    dispatch(userActions.setIsRoleSelectModalOpen(true));
  }, [dispatch]);

  const onCloseRoleSelectModal = useCallback(() => {
    dispatch(userActions.setIsRoleSelectModalOpen(false));
  }, [dispatch]);

  return {
    isRoleSelectModalOpen,
    onOpenRoleSelectModal,
    onCloseRoleSelectModal,
  };
};
