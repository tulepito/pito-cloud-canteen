/* eslint-disable react-hooks/rules-of-hooks */
import Badge, { EBadgeType } from '@components/Badge/Badge';
import type { TButtonVariant } from '@components/Button/Button';
import Button from '@components/Button/Button';
import NamedLink from '@components/NamedLink/NamedLink';
import type { TColumn } from '@components/Table/Table';
import { parseThousandNumber } from '@helpers/format';
import { useAppDispatch } from '@hooks/reduxHooks';
import { orderAsyncActions } from '@redux/slices/Order.slice';
import { companyPaths } from '@src/paths';
import {
  EBookerOrderDraftStates,
  EOrderDraftStates,
  EOrderStates,
  getLabelByKey,
  ORDER_STATES_OPTIONS,
} from '@utils/enums';
import type { TObject } from '@utils/types';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import { useIntl } from 'react-intl';

import css from './CompanyOrdersTable.module.scss';

const BADGE_TYPE_BASE_ON_ORDER_STATE = {
  [EBookerOrderDraftStates.bookerDraft]: EBadgeType.DEFAULT,
  [EOrderStates.canceled]: EBadgeType.DEFAULT,
  [EOrderStates.canceledByBooker]: EBadgeType.DEFAULT,
  [EOrderStates.completed]: EBadgeType.WARNING,
  [EOrderStates.inProgress]: EBadgeType.PROCESSING,
  [EOrderStates.pendingPayment]: EBadgeType.PROCESSING,
  [EOrderStates.picking]: EBadgeType.WARNING,
  [EOrderStates.reviewed]: EBadgeType.WARNING,
};

const BADGE_CLASS_NAME_BASE_ON_ORDER_STATE = {
  [EBookerOrderDraftStates.bookerDraft]: css.badgeDefault,
  [EOrderStates.canceled]: css.badgeDefault,
  [EOrderStates.canceledByBooker]: css.badgeDefault,
  [EOrderStates.completed]: css.badgeSuccess,
  [EOrderStates.inProgress]: css.badgeInProgress,
  [EOrderStates.pendingPayment]: css.badgeProcessing,
  [EOrderStates.picking]: css.badgeWarning,
  [EOrderStates.reviewed]: css.badgeWarning,
};

export const CompanyOrdersTableColumns: TColumn[] = [
  {
    key: 'title',
    label: 'Đơn hàng',
    render: (data: TObject) => {
      return (
        <NamedLink
          path={companyPaths.ManageOrderDetail}
          params={{ orderId: data.id }}>
          <div className={css.title}>#{data.title}</div>
        </NamedLink>
      );
    },
  },
  {
    key: 'deliveryTime',
    label: 'Thời gian',
    render: (data: TObject) => {
      return (
        <div className={css.deliveryTime}>
          <div className={css.deliveryHour}>{data.deliveryHour}</div>
          {data.startDate} - {data.endDate}
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
            <div key={restaurantName}>{restaurantName}</div>
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
      return <div className={css.location}>{location}</div>;
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
        <Badge
          containerClassName={classNames(
            css.badge,
            BADGE_CLASS_NAME_BASE_ON_ORDER_STATE[state],
          )}
          labelClassName={css.badgeLabel}
          type={BADGE_TYPE_BASE_ON_ORDER_STATE[state] || EBadgeType.DEFAULT}
          label={getLabelByKey(ORDER_STATES_OPTIONS, state)}
        />
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

      const navigateToOrderDetailPage = () => {
        router.push({
          pathname: companyPaths.EditDraftOrder,
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

      const secondaryButtonProps = {
        variant: 'inline' as TButtonVariant,
        className: css.actionButton,
      };

      const cancelOrderButton = (
        <Button key={'cancelOrderButton'} {...secondaryButtonProps}>
          {intl.formatMessage({
            id: 'ManageCompanyOrdersPage.actionBtn.cancelOrder',
          })}
        </Button>
      );
      const updateOrderButton = (
        <Button key={'updateOrderButton'} {...secondaryButtonProps}>
          {intl.formatMessage({
            id: 'ManageCompanyOrdersPage.actionBtn.updateOrder',
          })}
        </Button>
      );
      const viewDetailButton = (
        <Button key={'viewDetailButton'} {...secondaryButtonProps}>
          {intl.formatMessage({
            id: 'ManageCompanyOrdersPage.actionBtn.viewOrderDetail',
          })}
        </Button>
      );
      const reorderButton = (
        <Button key={'reorderButton'} {...secondaryButtonProps}>
          {intl.formatMessage({
            id: 'ManageCompanyOrdersPage.actionBtn.reorder',
          })}
        </Button>
      );
      const completeOrderButton = (
        <Button
          key={'completeOrderButton'}
          {...secondaryButtonProps}
          onClick={navigateToOrderDetailPage}>
          {intl.formatMessage({
            id: 'ManageCompanyOrdersPage.actionBtn.completeOrder',
          })}
        </Button>
      );
      const reviewOrderButton = (
        <Button key={'reviewOrderButton'} {...secondaryButtonProps}>
          {intl.formatMessage({
            id: 'ManageCompanyOrdersPage.actionBtn.reviewOrder',
          })}
        </Button>
      );
      const copyLinkButton = (
        <Button key={'copyLinkButton'} {...secondaryButtonProps}>
          {intl.formatMessage({
            id: 'ManageCompanyOrdersPage.actionBtn.copyOrderLink',
          })}
        </Button>
      );
      const deleteDraftButton = (
        <Button
          key={'deleteDraftButton'}
          {...secondaryButtonProps}
          onClick={handleDeleteDraftOrder}>
          {intl.formatMessage({
            id: 'ManageCompanyOrdersPage.actionBtn.deleteDraft',
          })}
        </Button>
      );

      let buttonList: Array<ReactNode> = [];

      switch (state) {
        case EBookerOrderDraftStates.bookerDraft:
          buttonList = [completeOrderButton, deleteDraftButton];
          break;
        case EOrderDraftStates.pendingApproval:
          buttonList = [completeOrderButton, deleteDraftButton];
          break;
        case EOrderStates.picking:
          buttonList = [cancelOrderButton, updateOrderButton, copyLinkButton];
          break;
        case EOrderStates.canceled:
          break;

        case EOrderStates.inProgress:
          buttonList = [viewDetailButton];
          break;
        case EOrderStates.completed:
          buttonList = [reviewOrderButton, reorderButton, copyLinkButton];
          break;
        case EOrderStates.reviewed:
          break;
        default:
          break;
      }

      return <div className={css.action}>{buttonList}</div>;
    },
  },
];
