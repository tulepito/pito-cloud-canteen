import IconDanger from '@components/Icons/IconDanger/IconDanger';
import LoadingContainer from '@components/LoadingContainer/LoadingContainer';
import AlertModal from '@components/Modal/AlertModal';
import NamedLink from '@components/NamedLink/NamedLink';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { menusSliceThunks } from '@redux/slices/menus.slice';
import { adminRoutes } from '@src/paths';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { shallowEqual } from 'react-redux';

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
      console.log(payload);
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
          <h3>
            <FormattedMessage id="ManagePartnerMenu.preventRemoveTitle" />
          </h3>
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
        <div className={css.removeTitle}>
          <FormattedMessage id="ManagePartnerMenu.removeTitle" />
        </div>
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
      onCancel={onClearMenuToRemove}
      onConfirm={onDeleteMenu}
      cancelLabel="Hủy"
      confirmLabel={!isInTransactionProgress && 'Xóa Menu'}
      confirmInProgress={removeMenuInProgress}
      confirmDisabled={removeMenuInProgress}
      cancelClassName={!isInTransactionProgress ? '' : css.modalCancelButton}>
      {renderContent()}
    </AlertModal>
  );
};

export default RemoveMenuConfirmModal;
