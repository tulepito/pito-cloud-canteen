import React, { Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import IconCheck from '@components/Icons/IconCheck/IconCheck';
import IconFood from '@components/Icons/IconFood/IconFood';
import IconNote from '@components/Icons/IconNote/IconNote';
import NamedLink from '@components/NamedLink/NamedLink';
import { useViewport } from '@hooks/useViewport';
import { EManageCompanyOrdersTab } from '@src/utils/enums';
import type { TOrderStateCountMap } from '@src/utils/types';

import css from './OrdersAnalysisSection.module.scss';

const IconArrow = () => {
  return (
    <svg
      width="21"
      height="20"
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4.16797 9.77148C4.16797 9.45507 4.4031 9.19358 4.70816 9.15219L4.79297 9.14648H17.293C17.6381 9.14648 17.918 9.42631 17.918 9.77148C17.918 10.0879 17.6828 10.3494 17.3778 10.3908L17.293 10.3965H4.79297C4.44779 10.3965 4.16797 10.1167 4.16797 9.77148Z"
        fill="#262626"
      />
      <path
        d="M11.811 5.19307C11.5664 4.94952 11.5655 4.55379 11.8091 4.30919C12.0305 4.08683 12.3776 4.06591 12.6227 4.24693L12.6929 4.30729L17.7346 9.32729C17.9576 9.54936 17.9779 9.89779 17.7955 10.1428L17.7346 10.213L12.693 15.2339C12.4484 15.4774 12.0527 15.4766 11.8091 15.232C11.5877 15.0097 11.5682 14.6624 11.7503 14.4181L11.8109 14.3482L16.4076 9.76993L11.811 5.19307Z"
        fill="#262626"
      />
    </svg>
  );
};

const ORDER_ANALYSIS_DATA = [
  {
    key: EManageCompanyOrdersTab.COMPLETED,
    orderCount: 0,
    orderLabel: <FormattedMessage id="OrdersAnalysisSection.completedOrders" />,
    orderMobileLabel: (
      <FormattedMessage id="OrdersAnalysisSection.mobileCompletedOrders" />
    ),
    icon: <IconCheck />,
    orderPath: (companyId: string) =>
      `/company/${companyId}/orders/?currentTab=${EManageCompanyOrdersTab.COMPLETED}`,
  },
  {
    key: EManageCompanyOrdersTab.SCHEDULED,
    orderCount: 0,
    orderLabel: (
      <FormattedMessage id="OrdersAnalysisSection.inProgressOrders" />
    ),
    orderMobileLabel: (
      <FormattedMessage id="OrdersAnalysisSection.mobileInProgressOrders" />
    ),
    icon: <IconFood />,
    orderPath: (companyId: string) =>
      `/company/${companyId}/orders/?currentTab=${EManageCompanyOrdersTab.SCHEDULED}`,
  },
  {
    key: EManageCompanyOrdersTab.DRAFT,
    orderCount: 0,
    orderLabel: <FormattedMessage id="OrdersAnalysisSection.draftOrders" />,
    orderMobileLabel: (
      <FormattedMessage id="OrdersAnalysisSection.mobileDraftOrders" />
    ),
    icon: <IconNote />,
    orderPath: (companyId: string) =>
      `/company/${companyId}/orders/?currentTab=${EManageCompanyOrdersTab.DRAFT}`,
  },
];

type TOrdersAnalysisSection = {
  totalItemMap: TOrderStateCountMap | null;
  inProgress: boolean;
};

const mapTotalItemMapToOrderAnalysisData = (
  totalItemMap: TOrderStateCountMap | null,
) => {
  const orderAnalysisData = ORDER_ANALYSIS_DATA.map((orderData) => {
    const orderCount = totalItemMap?.[orderData.key] || 0;

    return {
      ...orderData,
      orderCount,
    };
  });

  return orderAnalysisData;
};

const OrdersAnalysisSection: React.FC<TOrdersAnalysisSection> = (props) => {
  const { totalItemMap, inProgress } = props;
  const { companyId } = useRouter().query;
  const orderAnalysisData = mapTotalItemMapToOrderAnalysisData(totalItemMap);
  const { isMobileLayout } = useViewport();

  return (
    <div className={css.root}>
      <h3 className={classNames(css.title, 'font-semibold uppercase')}>
        <FormattedMessage id="OrdersAnalysisSection.title" />
      </h3>
      {inProgress ? (
        <div className={css.loadingContainer}>
          <Skeleton containerClassName={classNames(css.loading, css.first)} />
          <Skeleton containerClassName={css.loading} />
          <Skeleton containerClassName={css.loading} />
        </div>
      ) : (
        <div className={css.content}>
          {orderAnalysisData.map((orderData, index) => {
            const orderDetailsClass = classNames(css.orderDetails, {
              [css.completedOrders]:
                orderData.key === EManageCompanyOrdersTab.COMPLETED,
              [css.inProgressOrders]:
                orderData.key === EManageCompanyOrdersTab.SCHEDULED,
              [css.draftOrders]:
                orderData.key === EManageCompanyOrdersTab.DRAFT,
              [css.first]: index === 0,
            });

            const orderLabelClasses = classNames(css.orderLabel, {
              [css.completedOrders]:
                orderData.key === EManageCompanyOrdersTab.COMPLETED,
              [css.inProgressOrders]:
                orderData.key === EManageCompanyOrdersTab.SCHEDULED,
              [css.draftOrders]:
                orderData.key === EManageCompanyOrdersTab.DRAFT,
            });

            const iconClasses = classNames(css.icon, {
              [css.completedOrders]:
                orderData.key === EManageCompanyOrdersTab.COMPLETED,
              [css.inProgressOrders]:
                orderData.key === EManageCompanyOrdersTab.SCHEDULED,
              [css.draftOrders]:
                orderData.key === EManageCompanyOrdersTab.DRAFT,
            });

            const metaSectionClasses = classNames({
              [css.metaSection]: index === 0,
            });

            const CardLinkComponent = !isMobileLayout ? 'div' : NamedLink;
            const cardLinkComponentProps = !isMobileLayout
              ? {}
              : {
                  path: orderData.orderPath(companyId as string),
                };

            const OrderLinkComponent = isMobileLayout ? 'div' : NamedLink;
            const orderLinkComponentProps = isMobileLayout
              ? {}
              : {
                  path: orderData.orderPath(companyId as string),
                };

            return (
              <Fragment key={orderData.key}>
                <CardLinkComponent
                  {...cardLinkComponentProps}
                  className={orderDetailsClass}>
                  <div className={metaSectionClasses}>
                    <span className={iconClasses}>{orderData.icon}</span>
                    <div>
                      <p className={css.orderMobileLabel}>
                        {orderData.orderMobileLabel}
                      </p>
                      <p className={css.orderCount}>
                        {orderData.orderCount}{' '}
                        <span className={css.unit}>
                          <FormattedMessage id="OrdersAnalysisSection.unit" />
                        </span>
                      </p>
                      <p className={orderLabelClasses}>
                        {orderData.orderLabel}
                      </p>
                    </div>
                  </div>
                  <OrderLinkComponent
                    {...orderLinkComponentProps}
                    className={css.orderLink}>
                    <span className={css.linkText}>
                      <FormattedMessage id="OrdersAnalysisSection.details" />
                    </span>
                    <IconArrow />
                  </OrderLinkComponent>
                </CardLinkComponent>
              </Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersAnalysisSection;
