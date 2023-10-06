import { useEffect } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import { useRouter } from 'next/router';

import Badge from '@components/Badge/Badge';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconClock from '@components/Icons/IconClock/IconClock';
import IconDanger from '@components/Icons/IconDanger/IconDanger';
import IconDelete from '@components/Icons/IconDelete/IconDelete';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import AlertModal from '@components/Modal/AlertModal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Toggle from '@components/Toggle/Toggle';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { partnerPaths } from '@src/paths';
import { Listing } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';
import { EListingStates } from '@src/utils/enums';
import type { TListing, TObject } from '@src/utils/types';

import { PartnerManageMenusThunks } from '../PartnerManageMenus.slice';

import css from './MenuCard.module.scss';

type TMenuCardProps = {
  menu: TListing;
  onDeleteMenuCompleted: () => void;
};

const MenuCard: React.FC<TMenuCardProps> = ({
  menu,
  onDeleteMenuCompleted,
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const toggleMenuActiveStatusInProgress = useAppSelector(
    (state) => state.PartnerManageMenus.toggleMenuActiveStatusInProgress,
  );
  const deleteMenusInProgress = useAppSelector(
    (state) => state.PartnerManageMenus.deleteMenusInProgress,
  );
  const preDeleteMenusInProgress = useAppSelector(
    (state) => state.PartnerManageMenus.preDeleteMenusInProgress,
  );
  const confirmDeleteMenuModalControl = useBoolean();
  const cannotDeleteModalControl = useBoolean();

  const isAnyMenuActionsInProgress =
    toggleMenuActiveStatusInProgress ||
    deleteMenusInProgress ||
    preDeleteMenusInProgress;

  const menuGetter = Listing(menu);
  const menuId = menuGetter.getId();
  const { title: menuName } = menuGetter.getAttributes();
  const { startDate, endDate } = menuGetter.getPublicData();
  const { listingState = EListingStates.draft } = menuGetter.getMetadata();

  const isDraftMenu = listingState === EListingStates.draft;

  const today = new Date().getTime();
  const isInvalidTimeRangeMenu = endDate < today;
  const shouldShowActiveMenuToggle =
    !isInvalidTimeRangeMenu &&
    [EListingStates.published, EListingStates.closed].includes(listingState);

  const { form } = useForm({
    initialValues: {
      isActive: listingState === EListingStates.published,
    },
    onSubmit: () => {},
  });
  const isActiveField = useField(`isActive`, form);

  const isActiveValue = isActiveField.input.value;
  const formattedMenuValidTimeRange = `${formatTimestamp(
    startDate,
  )} - ${formatTimestamp(endDate)}`;

  useEffect(() => {
    if (typeof isActiveValue === 'boolean') {
      const newListingState = isActiveValue
        ? EListingStates.published
        : EListingStates.closed;

      if (
        newListingState !== listingState &&
        listingState !== EListingStates.draft
      ) {
        dispatch(
          PartnerManageMenusThunks.toggleMenuActiveStatus({
            id: menuId,
            newListingState,
          }),
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActiveValue, listingState]);

  const handleEditMenuClick = () => {
    router.push({ pathname: partnerPaths.EditMenu, query: { menuId } });
  };

  const handleDeleteMenuClick = async () => {
    const { payload } = await dispatch(
      PartnerManageMenusThunks.preDeleteMenus({ id: menuId }),
    );

    const { inProgressOrders = [] } = (payload || {}) as TObject;

    if (inProgressOrders.length > 0) {
      cannotDeleteModalControl.setTrue();
    } else {
      confirmDeleteMenuModalControl.setTrue();
    }
  };

  const handleConfirmDeleteMenusClick = async () => {
    confirmDeleteMenuModalControl.setFalse();

    const { meta } = await dispatch(
      PartnerManageMenusThunks.deleteMenus({ id: menuId }),
    );

    if (meta.requestStatus === 'fulfilled') {
      onDeleteMenuCompleted();
    }
  };

  return (
    <div className={css.root}>
      <div className={css.titleContainer}>
        <div>{menuName}</div>
        <IconArrow className={css.arrowIcon} direction="right" />
      </div>
      <div className={css.infoContainer}>
        <div className={css.timeContainer}>
          <IconClock />

          <div>{formattedMenuValidTimeRange}</div>
        </div>
        <RenderWhen condition={isDraftMenu}>
          <Badge label="Nháp" />
          <RenderWhen.False>
            <RenderWhen condition={isInvalidTimeRangeMenu}>
              <Badge label="Menu đã hết hạn" />
            </RenderWhen>
          </RenderWhen.False>
        </RenderWhen>
      </div>
      <div className={css.actionContainer}>
        <div
          onClick={handleEditMenuClick}
          className={css.iconContainer}
          aria-disabled={isAnyMenuActionsInProgress}>
          <IconEdit />
        </div>
        <div
          className={css.iconContainer}
          aria-disabled={isAnyMenuActionsInProgress}
          onClick={handleDeleteMenuClick}>
          <IconDelete />
        </div>
        <RenderWhen condition={shouldShowActiveMenuToggle}>
          <Toggle
            id={'MealDateForm.orderType'}
            status={isActiveValue ? 'on' : 'off'}
            disabled={isAnyMenuActionsInProgress}
            className={css.isActiveField}
            onClick={(value) => {
              isActiveField.input.onChange(value);
            }}
          />
        </RenderWhen>
      </div>

      <AlertModal
        isOpen={cannotDeleteModalControl.value}
        shouldFullScreenInMobile={false}
        shouldHideIconClose
        containerClassName={css.cannotDeleteMenuModal}
        handleClose={cannotDeleteModalControl.setFalse}
        cancelLabel={'Đã hiểu'}
        onCancel={cannotDeleteModalControl.setFalse}
        actionsClassName={css.cannotDeleteMenuModalAction}>
        <div className={css.iconContainer}>
          <IconDanger />
        </div>
        <div className={css.modalTitle}>Không thể xoá Menu</div>
        <div className={css.modalDescription}>
          Menu đang được triển khai trong các đơn hàng.
        </div>
      </AlertModal>

      <AlertModal
        isOpen={confirmDeleteMenuModalControl.value}
        title="Xoá Menu"
        shouldFullScreenInMobile={false}
        containerClassName={css.confirmDeleteMenuModal}
        handleClose={confirmDeleteMenuModalControl.setFalse}
        cancelLabel={'Huỷ'}
        confirmLabel="Xoá menu"
        onCancel={confirmDeleteMenuModalControl.setFalse}
        onConfirm={handleConfirmDeleteMenusClick}
        actionsClassName={css.confirmDeleteModalAction}>
        <div className={css.menuDescription}>
          Bạn có chắc chắn muốn xoá{' '}
          <span className={css.menuName}>{menuName}</span> không?
        </div>
      </AlertModal>
    </div>
  );
};

export default MenuCard;
