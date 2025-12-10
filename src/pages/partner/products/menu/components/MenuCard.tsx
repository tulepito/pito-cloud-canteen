import { useField, useForm } from 'react-final-form-hooks';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconClock from '@components/Icons/IconClock/IconClock';
import IconDanger from '@components/Icons/IconDanger/IconDanger';
import IconDelete from '@components/Icons/IconDelete/IconDelete';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import IconEye from '@components/Icons/IconEye/IconEye';
import AlertModal from '@components/Modal/AlertModal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import Toggle from '@components/Toggle/Toggle';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { partnerPaths } from '@src/paths';
import { Listing } from '@src/utils/data';
import { formatTimestamp } from '@src/utils/dates';
import { EListingStates } from '@src/utils/enums';
import type { TListing, TMenuStateHistory, TObject } from '@src/utils/types';

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
  const { listingState } = menuGetter.getMetadata();

  const isDraftMenu = listingState === EListingStates.draft;

  const today = new Date().getTime();
  const isInvalidTimeRangeMenu =
    DateTime.fromMillis(endDate).startOf('day') <
    DateTime.fromMillis(today).startOf('day');
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

  const menuStateHistory = menuGetter.getMetadata().menuStateHistory;
  const rejectedReason = menuStateHistory?.findLast(
    (item: TMenuStateHistory) => item.state === EListingStates.rejected,
  )?.rejectedReason;

  const handleMenuCardClick = (event: any) => {
    event.stopPropagation();
    router.push({ pathname: partnerPaths.EditMenu, query: { menuId } });
  };

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
      <div className={css.titleContainer} onClick={handleMenuCardClick}>
        <div className={css.titleWrapper}>
          <div className={css.menuName}>{menuName}</div>
          {listingState === EListingStates.pendingApproval && (
            <div className={css.statusBadge}>
              <Badge
                type={EBadgeType.warning}
                labelClassName="text-black"
                label="Chờ duyệt"
              />
            </div>
          )}
          {listingState === EListingStates.rejected && (
            <div className={css.statusBadge}>
              <Badge
                type={EBadgeType.danger}
                labelClassName="text-black"
                label="Cần chỉnh sửa"
              />
            </div>
          )}
        </div>
        <IconArrow className={css.arrowIcon} direction="right" />
      </div>
      <div className={css.infoContainer} onClick={handleMenuCardClick}>
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
        {listingState === EListingStates.rejected && rejectedReason && (
          <div className={css.reasonWrapper}>
            <span
              className={classNames(css.reasonText, 'self-start text-black')}>
              Phản hồi từ admin:
            </span>
            <span
              className={classNames(
                css.reasonText,
                'self-start text-black !font-semibold',
              )}
              dangerouslySetInnerHTML={{ __html: rejectedReason }}
            />
          </div>
        )}

        <div className={css.actionsRight}>
          <div
            onClick={handleEditMenuClick}
            className={css.iconContainer}
            aria-disabled={isAnyMenuActionsInProgress}>
            {listingState === EListingStates.published ? (
              <IconEye />
            ) : (
              <IconEdit />
            )}
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
