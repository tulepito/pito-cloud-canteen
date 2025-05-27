import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import { useRouter } from 'next/router';

import IconCheckStatus from '@components/Icons/IconCheckStatus/IconCheckStatus';
import IconReviewStar from '@components/Icons/IconReviewStar/IconReviewStar';
import IconSharing from '@components/Icons/IconSharing/IconSharing';
import IconTimer from '@components/Icons/IconTimer/IconTimer';
import NamedLink from '@components/NamedLink/NamedLink';
import { Listing } from '@src/utils/data';
import { timeAgo } from '@src/utils/dates';
import { ECompanyDashboardNotificationType } from '@src/utils/enums';
import type { TCompanyOrderNoticationMap, TListing } from '@src/utils/types';

import css from './NotificationSection.module.scss';

type TCompanyOrderNotification = {
  key: string;
  icon: React.ReactNode;
  label: (orderId: string) => React.ReactNode;
  order?: TListing | null;
};

const NOTIFICATION_LIST: TCompanyOrderNotification[] = [
  {
    key: ECompanyDashboardNotificationType.draftOrder,
    icon: <IconCheckStatus />,
    label: (orderId: string) => (
      <FormattedMessage
        id="NotificationSection.label.draftOrder"
        values={{ orderId }}
      />
    ),
  },
  {
    key: ECompanyDashboardNotificationType.completedOrder,
    icon: <IconReviewStar />,
    label: (orderId: string) => (
      <FormattedMessage
        id="NotificationSection.label.completedOrder"
        values={{ orderId }}
      />
    ),
  },
  {
    key: ECompanyDashboardNotificationType.deadlineDueOrder,
    icon: <IconTimer />,
    label: (orderId: string) => (
      <FormattedMessage
        id="NotificationSection.label.deadlineDueOrder"
        values={{ orderId }}
      />
    ),
  },
  {
    key: ECompanyDashboardNotificationType.pickingOrder,
    icon: <IconSharing />,
    label: (orderId: string) => (
      <FormattedMessage
        id="NotificationSection.label.pickingOrder"
        values={{ orderId }}
      />
    ),
  },
];

type TNotificationSectionProps = {
  companyOrderNotificationMap: TCompanyOrderNoticationMap;
  inProgress: boolean;
};

const renderListNotifications = (
  companyOrderNotificationMap: TCompanyOrderNoticationMap,
) => {
  return NOTIFICATION_LIST.reduce(
    (result: TCompanyOrderNoticationMap[], cur: any) => {
      if (
        !companyOrderNotificationMap[
          cur.key as keyof typeof companyOrderNotificationMap
        ]
      )
        return result;

      return [
        ...result,
        {
          ...cur,
          order:
            companyOrderNotificationMap[
              cur.key as keyof typeof companyOrderNotificationMap
            ],
        },
      ];
    },
    [],
  );
};

const NotificationSection: React.FC<TNotificationSectionProps> = (props) => {
  const { companyOrderNotificationMap, inProgress } = props;
  const intl = useIntl();

  const notifications = renderListNotifications(
    companyOrderNotificationMap,
  ) as unknown as TCompanyOrderNotification[];

  const router = useRouter();
  const { companyId } = router.query;
  const onNotificationClick = (item: TCompanyOrderNotification) => () => {
    const { order, key } = item;
    if (
      key === ECompanyDashboardNotificationType.deadlineDueOrder ||
      key === ECompanyDashboardNotificationType.pickingOrder
    ) {
      return router.push({
        pathname: `/company/orders/${order?.id?.uuid}/picking`,
      });
    }
    if (key === ECompanyDashboardNotificationType.draftOrder) {
      return router.push({
        pathname: `/company/booker/orders/draft/${order?.id?.uuid}`,
      });
    }

    return router.push({
      pathname: `/company/orders/${order?.id?.uuid}`,
    });
  };

  return (
    <div className={css.root}>
      <div className={css.titleWrapper}>
        <h3 className="font-bold text-base md:uppercase md:text-lg md:font-semibold mt-1">
          {intl.formatMessage({ id: 'NotificationSection.title' })}
        </h3>
        <NamedLink path={`/company/${companyId}/orders`}>
          <div className="flex text-blue-500">
            <p className="text-sm ml-2">
              {intl.formatMessage({ id: 'NotificationSection.viewAll' })}
            </p>
            <svg
              width="21"
              height="20"
              viewBox="0 0 21 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4.16797 9.77148C4.16797 9.45507 4.4031 9.19358 4.70816 9.15219L4.79297 9.14648H17.293C17.6381 9.14648 17.918 9.42631 17.918 9.77148C17.918 10.0879 17.6828 10.3494 17.3778 10.3908L17.293 10.3965H4.79297C4.44779 10.3965 4.16797 10.1167 4.16797 9.77148Z"
                fill="currentColor"></path>
              <path
                d="M11.811 5.19307C11.5664 4.94952 11.5655 4.55379 11.8091 4.30919C12.0305 4.08683 12.3776 4.06591 12.6227 4.24693L12.6929 4.30729L17.7346 9.32729C17.9576 9.54936 17.9779 9.89779 17.7955 10.1428L17.7346 10.213L12.693 15.2339C12.4484 15.4774 12.0527 15.4766 11.8091 15.232C11.5877 15.0097 11.5682 14.6624 11.7503 14.4181L11.8109 14.3482L16.4076 9.76993L11.811 5.19307Z"
                fill="currentColor"></path>
            </svg>
          </div>
        </NamedLink>
      </div>

      {inProgress ? (
        <div className={css.loadingContainer}>
          <Skeleton className={css.loading} />
          <Skeleton className={css.loading} />
          <Skeleton className={css.loading} />
          <Skeleton className={css.loading} />
        </div>
      ) : (
        <div className={css.notificationList}>
          {notifications.length > 0 ? (
            notifications.map((item: TCompanyOrderNotification) => (
              <div
                onClick={onNotificationClick(item)}
                key={item.key}
                className={css.notificationItem}>
                {item.icon}
                <div className={css.notificationContent}>
                  <h5 className={css.label}>
                    {item.order &&
                      item.label(Listing(item.order).getAttributes().title)}
                  </h5>
                  <p className={css.createdAt}>
                    {item.order &&
                      timeAgo(
                        new Date(Listing(item.order).getAttributes().createdAt),
                      )}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className={css.notificationItem}>
              {intl.formatMessage({ id: 'NotificationSection.noResults' })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationSection;
