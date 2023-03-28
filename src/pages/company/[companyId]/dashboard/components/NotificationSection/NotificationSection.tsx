import React from 'react';
import { FormattedMessage } from 'react-intl';
import Skeleton from 'react-loading-skeleton';
import { useRouter } from 'next/router';

import IconCheckStatus from '@components/Icons/IconCheckStatus/IconCheckStatus';
import IconReviewStar from '@components/Icons/IconReviewStar/IconReviewStar';
import IconSharing from '@components/Icons/IconSharing/IconSharing';
import IconTimer from '@components/Icons/IconTimer/IconTimer';
import NamedLink from '@components/NamedLink/NamedLink';
import { Listing } from '@src/utils/data';
import { timeAgo } from '@src/utils/dates';
import { ENotificationTypes } from '@src/utils/enums';
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
    key: ENotificationTypes.draftOrder,
    icon: <IconCheckStatus />,
    label: (orderId: string) => (
      <FormattedMessage
        id="NotificationSection.label.draftOrder"
        values={{
          orderId,
        }}
      />
    ),
  },
  {
    key: ENotificationTypes.completedOrder,
    icon: <IconReviewStar />,
    label: (orderId: string) => (
      <FormattedMessage
        id="NotificationSection.label.completedOrder"
        values={{
          orderId,
        }}
      />
    ),
  },
  {
    key: ENotificationTypes.deadlineDueOrder,
    icon: <IconTimer />,
    label: (orderId: string) => (
      <FormattedMessage
        id="NotificationSection.label.deadlineDueOrder"
        values={{
          orderId,
        }}
      />
    ),
  },
  {
    key: ENotificationTypes.pickingOrder,
    icon: <IconSharing />,
    label: (orderId: string) => (
      <FormattedMessage
        id="NotificationSection.label.pickingOrder"
        values={{
          orderId,
        }}
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
  const notifications = renderListNotifications(
    companyOrderNotificationMap,
  ) as unknown as TCompanyOrderNotification[];
  const router = useRouter();
  const { companyId } = router.query;
  const onNotificationClick = (item: TCompanyOrderNotification) => () => {
    const { order, key } = item;
    if (
      key === ENotificationTypes.deadlineDueOrder ||
      key === ENotificationTypes.pickingOrder
    ) {
      return router.push({
        pathname: `/company/orders/${order?.id?.uuid}/picking`,
      });
    }
    if (key === ENotificationTypes.draftOrder) {
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
        <h3 className={css.title}>
          <FormattedMessage id="NotificationSection.title" />
        </h3>
        <NamedLink path={`/company/${companyId}/orders`} className={css.seeAll}>
          <FormattedMessage id="NotificationSection.seeAll" />
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
              <FormattedMessage id="NotificationSection.noResults" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationSection;
