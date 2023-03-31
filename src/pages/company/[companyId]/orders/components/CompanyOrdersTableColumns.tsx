/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-hooks/rules-of-hooks */
import type { ReactNode } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import type { TButtonVariant } from '@components/Button/Button';
import Button from '@components/Button/Button';
import AlertModal from '@components/Modal/AlertModal';
import NamedLink from '@components/NamedLink/NamedLink';
import OrderDetailTooltip from '@components/OrderDetailTooltip/OrderDetailTooltip';
import type { TColumn } from '@components/Table/Table';
import Tooltip from '@components/Tooltip/Tooltip';
import { parseThousandNumber } from '@helpers/format';
import { getParticipantPickingLink } from '@helpers/orderHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { companyPaths } from '@src/paths';
import {
  EBookerOrderDraftStates,
  EOrderDraftStates,
  EOrderStates,
  getLabelByKey,
  ORDER_STATES_OPTIONS,
} from '@utils/enums';
import type { TIntegrationListing, TObject } from '@utils/types';

import css from './CompanyOrdersTable.module.scss';

const BADGE_TYPE_BASE_ON_ORDER_STATE = {
  [EBookerOrderDraftStates.bookerDraft]: EBadgeType.caution,
  [EOrderDraftStates.pendingApproval]: EBadgeType.caution,
  [EOrderStates.canceled]: EBadgeType.default,
  [EOrderStates.canceledByBooker]: EBadgeType.default,
  [EOrderStates.picking]: EBadgeType.warning,
  [EOrderStates.inProgress]: EBadgeType.info,
  [EOrderStates.pendingPayment]: EBadgeType.danger,
  [EOrderStates.completed]: EBadgeType.success,
  [EOrderStates.reviewed]: EBadgeType.success,
};

const BADGE_CLASS_NAME_BASE_ON_ORDER_STATE = {
  [EBookerOrderDraftStates.bookerDraft]: css.badgeDefault,
  [EOrderStates.canceled]: css.badgeDefault,
  [EOrderStates.canceledByBooker]: css.badgeDefault,
  [EOrderStates.completed]: css.badgeDefault,
  [EOrderStates.inProgress]: css.badgeDefault,
  [EOrderStates.pendingPayment]: css.badgeDefault,
  [EOrderStates.picking]: css.badgeDefault,
  [EOrderStates.reviewed]: css.badgeDefault,
};

export const CompanyOrdersTableColumns: TColumn[] = [
  {
    key: 'title',
    label: 'Đơn hàng',
    render: (data: TObject) => {
      const { id, isCreatedByPitoAdmin, title, state, plan } = data;
      const titleContent = (
        <div className={css.title}>
          #{title}
          {isCreatedByPitoAdmin && (
            <div className={css.createdByAmin}>{'Tạo bởi PITO'}</div>
          )}
        </div>
      );
      let returnComponent;

      if ([EOrderDraftStates.draft].includes(state)) {
        return titleContent;
      }

      if (
        [
          EOrderDraftStates.pendingApproval,
          EBookerOrderDraftStates.bookerDraft,
        ].includes(state)
      ) {
        return (
          <NamedLink
            path={companyPaths.EditDraftOrder}
            params={{ orderId: id }}>
            {titleContent}
          </NamedLink>
        );
      }

      if ([EOrderStates.picking].includes(state)) {
        returnComponent = (
          <NamedLink
            path={companyPaths.ManageOrderPicking}
            params={{ orderId: id }}>
            {titleContent}
          </NamedLink>
        );
      } else {
        returnComponent = (
          <NamedLink
            path={companyPaths.ManageOrderDetail}
            params={{ orderId: id }}>
            {titleContent}
          </NamedLink>
        );
      }

      const subOrders = [].concat(plan) as TIntegrationListing[];

      return (
        <Tooltip
          overlayClassName={css.orderDetailTooltip}
          overlayInnerStyle={{ backgroundColor: '#ffffff' }}
          showArrow={false}
          tooltipContent={<OrderDetailTooltip subOrders={subOrders} />}
          placement="bottomLeft">
          <div>{returnComponent}</div>
        </Tooltip>
      );
    },
  },
  {
    key: 'deliveryTime',
    label: 'Thời gian',
    render: ({ startDate, endDate, deliveryHour }: TObject) => {
      return (
        <div className={css.deliveryTime}>
          <div className={css.deliveryHour}>{deliveryHour}</div>
          {startDate && endDate && (
            <span>
              {startDate} - {endDate}
            </span>
          )}
        </div>
      );
    },
  },
  {
    key: 'orderType',
    label: 'Loại đơn',
    render: () => {
      return <div className={css.orderType}>PITO Cloud Canteen</div>;
    },
  },

  {
    key: 'restaurantName',
    label: 'Đơn vị phục vụ',
    render: ({ restaurants = [] }: TObject) => {
      const { length } = restaurants;
      const moreThanTwo = restaurants.length > 2;
      const remainLength = length - 2;

      return (
        <div className={css.restaurantName}>
          {restaurants.slice(0, 2).map((restaurantName: string) => (
            <div
              key={restaurantName}
              className={css.name}
              title={restaurantName}>
              {restaurantName}
            </div>
          ))}
          {moreThanTwo && (
            <div className={css.remainText}>+ {remainLength} đối tác </div>
          )}
        </div>
      );
    },
  },
  {
    key: 'address',
    label: 'Địa điểm giao hàng',
    render: ({ location }: TObject) => {
      return (
        <div className={css.location} title={location}>
          {location}
        </div>
      );
    },
  },
  {
    key: 'totalWithVAT',
    label: 'Giá trị đơn hàng',
    render: ({ totalWithVAT }: TObject) => {
      return (
        <div className={css.totalWithVAT}>
          {parseThousandNumber(totalWithVAT)}đ
        </div>
      );
    },
  },
  {
    key: 'state',
    label: 'Trạng thái',
    render: ({ state }: { state: EOrderStates }) => {
      return (
        <div className={css.state}>
          <Badge
            containerClassName={classNames(
              css.badge,
              BADGE_CLASS_NAME_BASE_ON_ORDER_STATE[state],
            )}
            labelClassName={css.badgeLabel}
            type={BADGE_TYPE_BASE_ON_ORDER_STATE[state] || EBadgeType.default}
            label={getLabelByKey(ORDER_STATES_OPTIONS, state)}
          />
        </div>
      );
    },
  },
  {
    key: 'action',
    label: '',
    render: ({
      state,
      id: orderId,
      companyId,
    }: {
      state:
        | EOrderStates
        | EBookerOrderDraftStates
        | EOrderDraftStates.pendingApproval;
      id: string;
      companyId: string;
    }) => {
      const intl = useIntl();
      const router = useRouter();
      const dispatch = useAppDispatch();
      const confirmDeleteDraftOrderActions = useBoolean(false);
      const updateOrderInProgress = useAppSelector(
        (state) => state.Order.updateOrderInProgress,
      );
      const deleteDraftOrderInProgress = useAppSelector(
        (state) => state.Order.deleteDraftOrderInProgress,
      );

      const orderLink = getParticipantPickingLink(orderId);

      const shouldShowReviewButton =
        state === EOrderStates.pendingPayment ||
        state === EOrderStates.completed;

      const navigateToDraftOrderDetailPage = () => {
        router.push({
          pathname: companyPaths.EditDraftOrder,
          query: { orderId },
        });
      };

      const navigateToOrderDetailPage = () => {
        router.push({
          pathname: companyPaths.ManageOrderDetail,
          query: { orderId },
        });
      };

      const navigateToBookerManageOrderDetailPage = () => {
        router.push({
          pathname: companyPaths.ManageOrderPicking,
          query: { orderId },
        });
      };

      const handleDeleteDraftOrder = () => {
        dispatch(
          orderAsyncActions.bookerDeleteDraftOrder({
            orderId,
            companyId,
          }),
        );
      };

      const handleCancelNeedApprovalOrder = () => {
        dispatch(
          orderAsyncActions.cancelPendingApprovalOrder({
            orderId,
          }),
        );
      };

      const handleCopyOrderLink = () => {
        navigator.clipboard.writeText(orderLink);
      };

      const handleReviewOrder = () => {
        router.push({
          pathname: companyPaths.OrderRating,
          query: { orderId },
        });
      };

      const secondaryButtonProps = {
        variant: 'inline' as TButtonVariant,
        className: css.actionButton,
        disabled: updateOrderInProgress,
      };

      const deleteDraftButton = (
        <Button
          key={`${orderId}-deleteDraftButton`}
          {...secondaryButtonProps}
          onClick={confirmDeleteDraftOrderActions.setTrue}>
          {intl.formatMessage({
            id: 'ManageCompanyOrdersPage.actionBtn.deleteDraft',
          })}
        </Button>
      );
      const cancelPickingOrderButton = (
        <Button
          key={`${orderId}-cancelPickingOrderButton`}
          {...secondaryButtonProps}
          onClick={navigateToBookerManageOrderDetailPage}>
          {intl.formatMessage({
            id: 'ManageCompanyOrdersPage.actionBtn.cancelPickingOrder',
          })}
        </Button>
      );
      const cancelPendingApprovalOrderButton = (
        <Button
          key={`${orderId}-cancelPendingApprovalOrderButton`}
          {...secondaryButtonProps}
          onClick={handleCancelNeedApprovalOrder}>
          {intl.formatMessage({
            id: 'ManageCompanyOrdersPage.actionBtn.cancelPendingApprovalOrder',
          })}
        </Button>
      );
      const updatePlanOrderDetailButton = (
        <Button
          key={`${orderId}-updatePlanOrderDetailButton`}
          {...secondaryButtonProps}
          onClick={navigateToBookerManageOrderDetailPage}>
          {intl.formatMessage({
            id: 'ManageCompanyOrdersPage.actionBtn.updatePlanOrderDetailButton',
          })}
        </Button>
      );
      const viewDetailButton = (
        <Button
          key={`${orderId}-viewDetailButton`}
          {...secondaryButtonProps}
          onClick={navigateToOrderDetailPage}>
          {intl.formatMessage({
            id: 'ManageCompanyOrdersPage.actionBtn.viewOrderDetail',
          })}
        </Button>
      );
      const completeOrderButton = (
        <Button
          key={`${orderId}-completeOrderButton`}
          {...secondaryButtonProps}
          onClick={navigateToDraftOrderDetailPage}>
          {intl.formatMessage({
            id: 'ManageCompanyOrdersPage.actionBtn.completeOrder',
          })}
        </Button>
      );
      const copyLinkButton = (
        <Button
          key={`${orderId}-copyLinkButton`}
          {...secondaryButtonProps}
          onClick={handleCopyOrderLink}>
          {intl.formatMessage({
            id: 'ManageCompanyOrdersPage.actionBtn.copyOrderLink',
          })}
        </Button>
      );

      const reviewOrderButton = shouldShowReviewButton ? (
        <Button
          key={`${orderId}-reviewOrderButton`}
          {...secondaryButtonProps}
          onClick={handleReviewOrder}>
          {intl.formatMessage({
            id: 'ManageCompanyOrdersPage.actionBtn.reviewOrder',
          })}
        </Button>
      ) : null;

      const reorderButton = (
        <Button
          key={`${orderId}-reorderButton`}
          {...secondaryButtonProps}
          disabled>
          {intl.formatMessage({
            id: 'ManageCompanyOrdersPage.actionBtn.reorder',
          })}
        </Button>
      );

      let buttonList: Array<ReactNode> = [];

      switch (state) {
        case EBookerOrderDraftStates.bookerDraft:
          buttonList = [completeOrderButton, deleteDraftButton];
          break;
        case EOrderDraftStates.pendingApproval:
          buttonList = [completeOrderButton, cancelPendingApprovalOrderButton];
          break;
        case EOrderStates.picking:
          buttonList = [
            updatePlanOrderDetailButton,
            cancelPickingOrderButton,
            copyLinkButton,
          ];
          break;
        case EOrderStates.canceled:
          break;

        case EOrderStates.inProgress:
          buttonList = [viewDetailButton];
          break;
        case EOrderStates.pendingPayment:
          buttonList = [reviewOrderButton, reorderButton];
          break;
        case EOrderStates.completed:
          buttonList = [reorderButton];
          break;
        case EOrderStates.reviewed:
          buttonList = [reorderButton];
          break;
        default:
          break;
      }

      const confirmDeleteDraftOrderModal = (
        <AlertModal
          isOpen={confirmDeleteDraftOrderActions.value}
          onCancel={confirmDeleteDraftOrderActions.setFalse}
          onConfirm={handleDeleteDraftOrder}
          confirmInProgress={deleteDraftOrderInProgress}
          handleClose={confirmDeleteDraftOrderActions.setFalse}
          title={intl.formatMessage({
            id: 'ManageCompanyOrdersPage.deleteDraftOrderModal.title',
          })}
          confirmLabel={intl.formatMessage({
            id: 'ManageCompanyOrdersPage.deleteDraftOrderModal.confirmBtn',
          })}
          cancelLabel={intl.formatMessage({
            id: 'ManageCompanyOrdersPage.deleteDraftOrderModal.cancelBtn',
          })}
        />
      );

      return (
        <div className={css.action}>
          {buttonList}
          {confirmDeleteDraftOrderModal}
        </div>
      );
    },
  },
];
