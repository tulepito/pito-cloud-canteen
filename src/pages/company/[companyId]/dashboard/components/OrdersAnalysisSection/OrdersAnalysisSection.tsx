import React from 'react';
import { FormattedMessage } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import classNames from 'classnames';
import { useRouter } from 'next/router';

import NamedLink from '@components/NamedLink/NamedLink';
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
    orderPath: (companyId: string) =>
      `/company/${companyId}/orders/?defaultTab=2`,
  },
  {
    key: EManageCompanyOrdersTab.SCHEDULED,
    orderCount: 0,
    orderLabel: (
      <FormattedMessage id="OrdersAnalysisSection.inProgressOrders" />
    ),
    orderPath: (companyId: string) =>
      `/company/${companyId}/orders/?defaultTab=1`,
  },
  {
    key: EManageCompanyOrdersTab.DRAFT,
    orderCount: 0,
    orderLabel: <FormattedMessage id="OrdersAnalysisSection.draftOrders" />,
    orderPath: (companyId: string) =>
      `/company/${companyId}/orders/?defaultTab=3`,
  },
];

type TOrdersAnalysisSection = {
  totalItemMap: TOrderStateCountMap;
  inProgress: boolean;
};

const mapTotalItemMapToOrderAnalysisData = (
  totalItemMap: TOrderStateCountMap,
) => {
  const orderAnalysisData = ORDER_ANALYSIS_DATA.map((orderData) => {
    const orderCount = totalItemMap[orderData.key];

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

  return (
    <div className={css.root}>
      <h3 className={css.title}>
        <FormattedMessage id="OrdersAnalysisSection.title" />
      </h3>
      {inProgress ? (
        <div className={css.loadingContainer}>
          <Skeleton containerClassName={css.loading} />
          <Skeleton containerClassName={css.loading} />
          <Skeleton containerClassName={css.loading} />
        </div>
      ) : (
        <div className={css.content}>
          {orderAnalysisData.map((orderData) => {
            const orderDetailsClass = classNames(css.orderDetails, {
              [css.completedOrders]:
                orderData.key === EManageCompanyOrdersTab.COMPLETED,
              [css.inProgressOrders]:
                orderData.key === EManageCompanyOrdersTab.SCHEDULED,
              [css.draftOrders]:
                orderData.key === EManageCompanyOrdersTab.DRAFT,
            });

            const orderLabelClasses = classNames(css.orderLabel, {
              [css.completedOrders]:
                orderData.key === EManageCompanyOrdersTab.COMPLETED,
              [css.inProgressOrders]:
                orderData.key === EManageCompanyOrdersTab.SCHEDULED,
              [css.draftOrders]:
                orderData.key === EManageCompanyOrdersTab.DRAFT,
            });

            return (
              <div key={orderData.key} className={orderDetailsClass}>
                <p className={css.orderCount}>{orderData.orderCount}</p>
                <p className={orderLabelClasses}>{orderData.orderLabel}</p>
                <NamedLink
                  path={orderData.orderPath(companyId as string)}
                  className={css.orderLink}>
                  <FormattedMessage id="OrdersAnalysisSection.details" />
                  <IconArrow />
                </NamedLink>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersAnalysisSection;
