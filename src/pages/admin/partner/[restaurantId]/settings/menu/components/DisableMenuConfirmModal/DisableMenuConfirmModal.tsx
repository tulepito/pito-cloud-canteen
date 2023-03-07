import type { ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { shallowEqual } from 'react-redux';

import IconDanger from '@components/Icons/IconDanger/IconDanger';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import AlertModal from '@components/Modal/AlertModal';
import NamedLink from '@components/NamedLink/NamedLink';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { menusSliceThunks } from '@redux/slices/menus.slice';
import { adminRoutes } from '@src/paths';

import css from './DisableMenuConfirmModal.module.scss';

type TDisableMenuConfirmModal = {
  menuToDisable: any;
  onClearMenuToDisable: () => void;
  onDisabledMenu: () => void;
  disableMenuInProgress: boolean;
  inProgressTitle: string | ReactNode;
  title: string | ReactNode;
  confirmLabel?: string;
  inProgressContent: string | ReactNode;
  content: string | ReactNode;
};

const DisableMenuConfirmModal: React.FC<TDisableMenuConfirmModal> = (props) => {
  const {
    menuToDisable,
    onClearMenuToDisable,
    onDisabledMenu,
    disableMenuInProgress,
    inProgressTitle,
    title,
    confirmLabel,
    inProgressContent,
    content,
  } = props;
  const dispatch = useAppDispatch();

  const isCheckingMenuInTransactionProgress = useAppSelector(
    (state) => state.menus.isCheckingMenuInTransactionProgress,
    shallowEqual,
  );

  const [isInTransactionProgress, setIsInTransactionProgress] =
    useState<boolean>(false);

  useEffect(() => {
    if (!menuToDisable) return;
    const checkShouldRemoveMenu = async () => {
      const { payload } = (await dispatch(
        menusSliceThunks.checkingMenuInTransactionProgress(menuToDisable.id),
      )) as any;
      setIsInTransactionProgress(payload);
    };
    checkShouldRemoveMenu();
  }, [JSON.stringify(menuToDisable)]);

  const renderContent = () => {
    if (isCheckingMenuInTransactionProgress) {
      return <LoadingContainer className={css.loading} />;
    }
    if (isInTransactionProgress) {
      return (
        <div className={css.preventRemoveMenuContainer}>
          <IconDanger />
          <p className={css.preventRemoveMenuContent}>
            <FormattedMessage
              id="ManagePartnerMenu.preventRemoveContent"
              values={{
                link: (
                  <NamedLink
                    className={css.link}
                    path={adminRoutes.ManageOrders.path}>
                    {inProgressContent}
                  </NamedLink>
                ),
              }}
            />
          </p>
        </div>
      );
    }
    return (
      <>
        <p className={css.removeContent}>{content}</p>
      </>
    );
  };

  return (
    <AlertModal
      isOpen={!!menuToDisable}
      handleClose={onClearMenuToDisable}
      title={
        isInTransactionProgress ? (
          <span className={css.removeTitle}>{inProgressTitle}</span>
        ) : (
          <span className={css.removeTitle}>{title}</span>
        )
      }
      onCancel={onClearMenuToDisable}
      onConfirm={onDisabledMenu}
      cancelLabel={isCheckingMenuInTransactionProgress ? '' : 'Hủy'}
      confirmLabel={
        !isInTransactionProgress && isCheckingMenuInTransactionProgress
          ? ''
          : confirmLabel
      }
      confirmInProgress={disableMenuInProgress}
      confirmDisabled={disableMenuInProgress}
      childrenClassName={css.modalChildren}
      cancelClassName={
        !isInTransactionProgress || isCheckingMenuInTransactionProgress
          ? ''
          : css.modalCancelButton
      }>
      {renderContent()}
    </AlertModal>
  );
};

export default DisableMenuConfirmModal;
