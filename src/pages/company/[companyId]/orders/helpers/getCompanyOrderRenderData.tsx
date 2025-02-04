import type { ReactNode } from 'react';
import Skeleton from 'react-loading-skeleton';

import { InlineTextButton } from '@components/Button/Button';
import NamedLink from '@components/NamedLink/NamedLink';
import OrderDetailTooltip from '@components/OrderDetailTooltip/OrderDetailTooltip';
import Tooltip from '@components/Tooltip/Tooltip';
import Tracker from '@helpers/tracker';
import { companyPaths } from '@src/paths';
import { diffDays } from '@src/utils/dates';
import {
  EBookerOrderDraftStates,
  EOrderDraftStates,
  EOrderStates,
} from '@src/utils/enums';
import type { TIntegrationListing } from '@src/utils/types';

import css from '../components/CompanyOrdersTable.module.scss';

export interface CompanyOrderMobileRenderData {
  onClick?: () => void | null;
  namedLinkProps?: {
    path: string;
    params: {
      orderId: string;
    };
  };
}

export function getCompanyOrderRenderData(
  data: any,
  options?: { isMobileLayout?: boolean },
): ReactNode | CompanyOrderMobileRenderData {
  const { isMobileLayout } = options || {};
  const {
    id,
    isCreatedByPitoAdmin,
    title,
    state,
    plan,
    openOrderStateWarningModal,
    startDateTimestamp,
    orderId,
    setSelectedOrderId,
    queryCompanyPlansByOrderIdsInProgress,
  } = data;
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
    if (isMobileLayout) return {};

    return titleContent;
  }

  const openOrderStateWarningModalFn = () => {
    openOrderStateWarningModal(state);
    setSelectedOrderId(orderId);
  };

  if (state === EOrderStates.canceled || state === EOrderStates.expiredStart) {
    if (isMobileLayout) return { onClick: openOrderStateWarningModalFn };

    return (
      <InlineTextButton onClick={openOrderStateWarningModalFn}>
        {titleContent}
      </InlineTextButton>
    );
  }

  if (
    [
      EOrderDraftStates.pendingApproval,
      EBookerOrderDraftStates.bookerDraft,
    ].includes(state)
  ) {
    const namedLinkProps = {
      path: companyPaths.EditDraftOrder,
      params: { orderId: id },
    };

    if (isMobileLayout) return { namedLinkProps };

    return (
      <NamedLink
        onClick={() => {
          Tracker.track('booker:order:view', {
            orderId: id,
          });
        }}
        {...namedLinkProps}>
        {titleContent}
      </NamedLink>
    );
  }

  if ([EOrderStates.picking].includes(state)) {
    const today = new Date().getTime();
    const isTodayAfterStartDate =
      Number(diffDays(startDateTimestamp, today, 'day').days) < 0;
    const onPickingStateClick = () => {
      openOrderStateWarningModal('expireStartOrder');
      setSelectedOrderId(orderId);
    };

    if (isTodayAfterStartDate) {
      if (isMobileLayout) return { onClick: onPickingStateClick };

      return (
        <InlineTextButton onClick={onPickingStateClick}>
          {titleContent}
        </InlineTextButton>
      );
    }

    const namedLinkProps = {
      path: companyPaths.ManageOrderPicking,
      params: { orderId: id },
    };

    if (isMobileLayout) return { namedLinkProps };

    returnComponent = (
      <NamedLink
        onClick={() => {
          Tracker.track('booker:order:view', {
            orderId: id,
          });
        }}
        {...namedLinkProps}>
        {titleContent}
      </NamedLink>
    );
  } else {
    const namedLinkProps = {
      path: companyPaths.ManageOrderDetail,
      params: { orderId: id },
    };

    if (isMobileLayout) return { namedLinkProps };

    returnComponent = (
      <NamedLink
        onClick={() => {
          Tracker.track('booker:order:view', {
            orderId: id,
          });
        }}
        {...namedLinkProps}>
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
      tooltipContent={
        queryCompanyPlansByOrderIdsInProgress ? (
          <Skeleton />
        ) : (
          <OrderDetailTooltip subOrders={subOrders} />
        )
      }
      placement="bottomLeft">
      <div>{returnComponent}</div>
    </Tooltip>
  );
}
