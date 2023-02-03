import Badge, { EBadgeType } from '@components/Badge/Badge';
import type { TButtonVariant } from '@components/Button/Button';
import Button from '@components/Button/Button';
import NamedLink from '@components/NamedLink/NamedLink';
import type { TColumn } from '@components/Table/Table';
import { parseThousandNumber } from '@helpers/format';
import {
  BADGE_CLASSNAME_BASE_ON_ORDER_STATE,
  BADGE_TYPE_BASE_ON_ORDER_STATE,
} from '@pages/admin/order/ManageOrders.page';
import { companyPaths } from '@src/paths';
import {
  EOrderStates,
  getLabelByKey,
  ORDER_STATES_OPTIONS,
} from '@utils/enums';
import type { TObject } from '@utils/types';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useIntl } from 'react-intl';

import css from './CompanyOrdersTable.module.scss';

export const CompanyOrdersTableColumns: TColumn[] = [
  {
    key: 'title',
    label: 'Đơn hàng',
    render: (data: TObject) => {
      return (
        <NamedLink path={`${companyPaths.ManageOrderDetail}/${data.id}`}>
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
            BADGE_CLASSNAME_BASE_ON_ORDER_STATE[state],
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
    render: ({ state }: { state: EOrderStates }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const intl = useIntl();

      const secondaryButtonProps = {
        variant: 'inline' as TButtonVariant,
        className: css.actionButton,
      };

      const cancelOrderButton = (
        <Button {...secondaryButtonProps}>
          {intl.formatMessage({
            id: 'ManageCompanyOrdersPage.actionBtn.cancelOrder',
          })}
        </Button>
      );
      const updateOrderButton = (
        <Button {...secondaryButtonProps}>
          {intl.formatMessage({
            id: 'ManageCompanyOrdersPage.actionBtn.updateOrder',
          })}
        </Button>
      );
      const viewDetailButton = (
        <Button {...secondaryButtonProps}>
          {intl.formatMessage({
            id: 'ManageCompanyOrdersPage.actionBtn.viewOrderDetail',
          })}
        </Button>
      );
      const reorderButton = (
        <Button {...secondaryButtonProps}>
          {intl.formatMessage({
            id: 'ManageCompanyOrdersPage.actionBtn.reorder',
          })}
        </Button>
      );
      const completeOrderButton = (
        <Button {...secondaryButtonProps}>
          {intl.formatMessage({
            id: 'ManageCompanyOrdersPage.actionBtn.completeOrder',
          })}
        </Button>
      );
      const reviewOrderButton = (
        <Button {...secondaryButtonProps}>
          {intl.formatMessage({
            id: 'ManageCompanyOrdersPage.actionBtn.reviewOrder',
          })}
        </Button>
      );
      const copyLinkButton = (
        <Button {...secondaryButtonProps}>
          {intl.formatMessage({
            id: 'ManageCompanyOrdersPage.actionBtn.copyOrderLink',
          })}
        </Button>
      );
      const deleteDraftButton = (
        <Button {...secondaryButtonProps}>
          {intl.formatMessage({
            id: 'ManageCompanyOrdersPage.actionBtn.deleteDraft',
          })}
        </Button>
      );

      let buttonList: Array<ReactNode> = [];

      switch (state) {
        case EOrderStates.isNew:
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
