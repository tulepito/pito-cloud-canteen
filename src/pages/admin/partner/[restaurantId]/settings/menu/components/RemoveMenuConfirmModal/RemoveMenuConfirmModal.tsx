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

import css from './RemoveMenuConfirmModal.module.scss';

type TRemoveMenuConfirmModal = {
  menuToRemove: any;
  onClearMenuToRemove: () => void;
  onDeleteMenu: () => void;
  removeMenuInProgress: boolean;
};

const RemoveMenuConfirmModal: React.FC<TRemoveMenuConfirmModal> = (props) => {
  const {
    menuToRemove,
    onClearMenuToRemove,
    onDeleteMenu,
    removeMenuInProgress,
  } = props;
  const dispatch = useAppDispatch();

  const isCheckingMenuInTransactionProgress = useAppSelector(
    (state) => state.menus.isCheckingMenuInTransactionProgress,
    shallowEqual,
  );

  const [isInTransactionProgress, setIsInTransactionProgress] =
    useState<boolean>(false);

  useEffect(() => {
    if (!menuToRemove) return;
    const checkShouldRemoveMenu = async () => {
      const { payload } = (await dispatch(
        menusSliceThunks.checkingMenuInTransactionProgress(menuToRemove.id),
      )) as any;
      setIsInTransactionProgress(payload);
    };
    checkShouldRemoveMenu();
  }, [JSON.stringify(menuToRemove)]);

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
                    <FormattedMessage id="ManagePartnerMenu.preventRemoveLink" />
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
        <p className={css.removeContent}>
          <FormattedMessage
            id="ManagePartnerMenu.removeContent"
            values={{
              menuTitle: (
                <div className={css.menuTitle}>
                  {menuToRemove && menuToRemove.title}
                </div>
              ),
            }}
          />
        </p>
      </>
    );
  };

  return (
    <AlertModal
      isOpen={menuToRemove}
      handleClose={onClearMenuToRemove}
      title={
        isInTransactionProgress ? (
          <span className={css.removeTitle}>
            <FormattedMessage id="ManagePartnerMenu.preventRemoveTitle" />
          </span>
        ) : (
          <span className={css.removeTitle}>
            <FormattedMessage id="ManagePartnerMenu.removeTitle" />
          </span>
        )
      }
      onCancel={onClearMenuToRemove}
      onConfirm={onDeleteMenu}
      cancelLabel={isCheckingMenuInTransactionProgress ? '' : 'Hủy'}
      confirmLabel={
        !isInTransactionProgress && isCheckingMenuInTransactionProgress
          ? ''
          : 'Xóa Menu'
      }
      confirmInProgress={removeMenuInProgress}
      confirmDisabled={removeMenuInProgress}
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

export default RemoveMenuConfirmModal;
