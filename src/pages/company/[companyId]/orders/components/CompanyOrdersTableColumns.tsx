/* eslint-disable @typescript-eslint/no-shadow */
import React, { type ReactNode } from 'react';
import type { IntlShape } from 'react-intl';
import { defineMessages, useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import Badge, { EBadgeType } from '@components/Badge/Badge';
import type { TButtonVariant } from '@components/Button/Button';
import Button from '@components/Button/Button';
import AlertModal from '@components/Modal/AlertModal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import { parseThousandNumber } from '@helpers/format';
import { getParticipantPickingLink } from '@helpers/order/prepareDataHelper';
import Tracker from '@helpers/tracker';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import useBoolean from '@hooks/useBoolean';
import { BookerNewOrderAction } from '@pages/company/booker/orders/new/BookerNewOrder.slice';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { QuizActions } from '@redux/slices/Quiz.slice';
import { companyPaths } from '@src/paths';
import { diffDays } from '@src/utils/dates';
import { getLabelByKey } from '@src/utils/options';
import {
  EBookerOrderDraftStates,
  EOrderDraftStates,
  EOrderStates,
} from '@utils/enums';
import type { TObject } from '@utils/types';

import { BADGE_TYPE_BASE_ON_ORDER_STATE } from '../helpers/constants';
import { getCompanyOrderRenderData } from '../helpers/getCompanyOrderRenderData';

import css from './CompanyOrdersTable.module.scss';

const BADGE_CLASS_NAME_BASE_ON_ORDER_STATE = {
  [EBookerOrderDraftStates.bookerDraft]: css.badgeDefault,
  [EOrderStates.canceled]: css.badgeDefault,
  [EOrderStates.canceledByBooker]: css.badgeDefault,
  [EOrderStates.completed]: css.badgeDefault,
  [EOrderStates.inProgress]: css.badgeDefault,
  [EOrderStates.pendingPayment]: css.badgeDefault,
  [EOrderStates.picking]: css.badgeDefault,
  [EOrderStates.reviewed]: css.badgeDefault,
  [EOrderStates.expiredStart]: css.badgeDefault,
};

const CompanyOrdersActionColumn = ({
  state,
  id: orderId,
  companyId,
  hasRating,
  isGroupOrder,
  startDateTimestamp,
  openOrderStateWarningModal,
  setSelectedOrderId,
}: TObject) => {
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
  const reorderInProgressId = useAppSelector(
    (state) => state.Order.reorderInProgressId,
  );
  const company = useAppSelector((state) => state.company.company);
  const orders = useAppSelector((state) => state.Order.orders);

  const orderLink = getParticipantPickingLink({
    orderId,
    companyId,
  });

  const shouldShowReviewButton =
    (state === EOrderStates.pendingPayment && !hasRating) ||
    state === EOrderStates.completed;

  const navigateToDraftOrderDetailPage = () => {
    router.push({
      pathname: companyPaths.EditDraftOrder,
      query: { orderId },
    });
  };

  const navigateToOrderDetailPage = () => {
    Tracker.track('booker:order:view', {
      orderId,
    });
    router.push({
      pathname: companyPaths.ManageOrderDetail,
      query: { orderId },
    });
  };

  const navigateToBookerManageOrderDetailPage = () => {
    const today = new Date().getTime();
    const isTodayAfterStartDate =
      Number(diffDays(startDateTimestamp, today, 'day').days) < 0;

    if (state === EOrderStates.picking && isTodayAfterStartDate) {
      openOrderStateWarningModal('expireStartOrder');
      setSelectedOrderId(orderId);
    } else {
      router.push({
        pathname: companyPaths.ManageOrderPicking,
        query: { orderId },
      });
    }
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

  const handleReorder = () => {
    dispatch(QuizActions.openReorder());
    dispatch(QuizActions.openQuizFlow());
    dispatch(QuizActions.copyPreviousOrder());
    dispatch(BookerNewOrderAction.setMyCompanies([company]));
    dispatch(BookerNewOrderAction.setCompanyId(companyId));
    dispatch(QuizActions.setSelectedCompany(company));
    const order = orders.find((o) => o.id.uuid === orderId);
    dispatch(QuizActions.setPreviousOrder(order));
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

  const reorderInProgress = reorderInProgressId === orderId;

  const reorderButton = (
    <Button
      key={`${orderId}-reorderButton`}
      {...secondaryButtonProps}
      onClick={handleReorder}
      inProgress={reorderInProgress}
      type="button"
      disabled={reorderInProgress}>
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
      buttonList = isGroupOrder
        ? [
            updatePlanOrderDetailButton,
            cancelPickingOrderButton,
            copyLinkButton,
          ]
        : [updatePlanOrderDetailButton, cancelPickingOrderButton];
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
      buttonList = [reviewOrderButton, reorderButton];
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
};

const messages = defineMessages({
  title: {
    id: 'CompanyOrdersTableColumns.title',
    defaultMessage: 'Order',
  },
  deliveryTime: {
    id: 'CompanyOrdersTableColumns.deliveryTime',
    defaultMessage: 'Delivery Time',
  },
  orderType: {
    id: 'CompanyOrdersTableColumns.orderType',
    defaultMessage: 'Order Type',
  },
  restaurantName: {
    id: 'CompanyOrdersTableColumns.restaurantName',
    defaultMessage: 'Serving Unit',
  },
  address: {
    id: 'CompanyOrdersTableColumns.address',
    defaultMessage: 'Delivery Location',
  },
  totalWithVAT: {
    id: 'CompanyOrdersTableColumns.totalWithVAT',
    defaultMessage: 'Order Value',
  },
  state: {
    id: 'CompanyOrdersTableColumns.state',
    defaultMessage: 'Status',
  },
});

export const getCompanyOrdersTableColumns = (
  intl: IntlShape,
  ORDER_STATE_OPTIONS: { key: string; label: string }[],
) => [
  {
    key: 'title',
    label: intl.formatMessage(messages.title),
    render: (data: TObject) => {
      const companyOrderRenderData = getCompanyOrderRenderData(data);

      if (React.isValidElement(companyOrderRenderData))
        return companyOrderRenderData;

      return <div></div>;
    },
  },
  {
    key: 'deliveryTime',
    label: intl.formatMessage(messages.deliveryTime),
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
    label: intl.formatMessage(messages.orderType),
    render: () => {
      return <div className={css.orderType}>PITO Cloud Canteen</div>;
    },
  },

  {
    key: 'restaurantName',
    label: intl.formatMessage(messages.restaurantName),
    render: ({
      restaurants = [],
      queryCompanyPlansByOrderIdsInProgress,
    }: TObject) => {
      const { length } = restaurants;
      const moreThanTwo = restaurants.length > 2;
      const remainLength = length - 2;

      return (
        <div className={css.restaurantName}>
          {queryCompanyPlansByOrderIdsInProgress ? (
            <Skeleton />
          ) : (
            restaurants.slice(0, 2).map((restaurantName: string) => (
              <div
                key={restaurantName}
                className={css.name}
                title={restaurantName}>
                {restaurantName}
              </div>
            ))
          )}
          {moreThanTwo && (
            <div className={css.remainText}>+ {remainLength} đối tác </div>
          )}
        </div>
      );
    },
  },
  {
    key: 'address',
    label: intl.formatMessage(messages.address),
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
    label: intl.formatMessage(messages.totalWithVAT),
    render: ({
      totalWithVAT,
      queryCompanyPlansByOrderIdsInProgress,
    }: TObject) => {
      return (
        <div className={css.totalWithVAT}>
          {queryCompanyPlansByOrderIdsInProgress ? (
            <Skeleton />
          ) : (
            `${parseThousandNumber(totalWithVAT)}đ`
          )}
        </div>
      );
    },
  },
  {
    key: 'state',
    label: intl.formatMessage(messages.state),
    render: ({
      state,
      paymentStatus,
    }: {
      state: EOrderStates;
      paymentStatus: boolean;
    }) => {
      return (
        <div className={css.state}>
          <RenderWhen
            condition={
              Boolean(paymentStatus) &&
              (state === EOrderStates.completed ||
                state === EOrderStates.pendingPayment)
            }>
            <Badge type={EBadgeType.success} label="Đã hoàn thành" />
            <RenderWhen.False>
              <Badge
                containerClassName={classNames(
                  css.badge,
                  BADGE_CLASS_NAME_BASE_ON_ORDER_STATE[state],
                )}
                labelClassName={css.badgeLabel}
                type={
                  BADGE_TYPE_BASE_ON_ORDER_STATE[state] || EBadgeType.default
                }
                label={getLabelByKey(ORDER_STATE_OPTIONS, state)}
              />
            </RenderWhen.False>
          </RenderWhen>
        </div>
      );
    },
  },
  {
    key: 'action',
    label: '',
    render: (data: any) => <CompanyOrdersActionColumn {...data} />,
  },
];
