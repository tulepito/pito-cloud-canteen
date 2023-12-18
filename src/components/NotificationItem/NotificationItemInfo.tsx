import { useIntl } from 'react-intl';

import { calcPastTime, formatTimestamp } from '@src/utils/dates';
import { ENotificationType } from '@src/utils/enums';

import css from './NotificationItem.module.scss';

type NotificationItemInfoProps = {
  type: string;
  notificationItem: {
    time: number;
    [key: string]: any;
  };
};
const NotificationItemInfo: React.FC<NotificationItemInfoProps> = (props) => {
  const { type, notificationItem } = props;
  const intl = useIntl();
  const {
    createdAt,
    bookerName,
    companyName,
    orderTitle,
    date = 0,
    subOrderDate = 0,
    foodName,
    subOrderName: subOrderNameFromData,
    startDate,
    endDate,
    partnerName,
    subOrderName: partnerSubOrderName,
  } = notificationItem;
  const { seconds } = createdAt;
  const formattedDate = formatTimestamp(date || subOrderDate);
  const subOrderName =
    subOrderNameFromData || `${companyName}_${formattedDate}`;
  const orderDates = `${formatTimestamp(
    startDate,
    'dd/MM',
  )} - ${formatTimestamp(endDate, 'dd/MM')}`;

  const pastTime = calcPastTime(seconds * 1000);

  switch (type) {
    case ENotificationType.INVITATION:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.invitation',
              },
              {
                span: (msg) => <span className={css.boldText}>{msg}</span>,
                bookerName,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );
    case ENotificationType.COMPANY_JOINED:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.companyJoined',
              },
              {
                span: (msg) => <span className={css.boldText}>{msg}</span>,
                companyName,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );
    case ENotificationType.ORDER_PICKING:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.orderPicking',
              },
              {
                span: (msg: any) => <span className={css.boldText}>{msg}</span>,
                orderTitle: `#${orderTitle}`,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );
    case ENotificationType.ORDER_DELIVERING:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.orderDelivering',
              },
              {
                span: (msg: any) => <span className={css.boldText}>{msg}</span>,
                subOrderDate: formattedDate,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );

    case ENotificationType.ORDER_CANCEL:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.orderCancel',
              },
              {
                span: (msg: any) => <span className={css.boldText}>{msg}</span>,
                subOrderDate: formattedDate,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );
    case ENotificationType.ORDER_SUCCESS:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.orderSuccess',
              },
              {
                span: (msg: any) => <span className={css.boldText}>{msg}</span>,
                subOrderDate: formattedDate,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );
    case ENotificationType.ORDER_RATING:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.orderRating',
              },
              {
                span: (msg: any) => <span className={css.boldText}>{msg}</span>,
                foodName,
                subOrderDate: formattedDate,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );

    case ENotificationType.SUB_ORDER_INPROGRESS:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.subOrderInprogress',
              },
              {
                span: (msg: any) => <span className={css.boldText}>{msg}</span>,
                subOrderName,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );
    case ENotificationType.SUB_ORDER_DELIVERING:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.subOrderDelivering',
              },
              {
                span: (msg: any) => <span className={css.boldText}>{msg}</span>,
                subOrderName,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );
    case ENotificationType.SUB_ORDER_DELIVERED:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.subOrderDelivered',
              },
              {
                span: (msg: any) => <span className={css.boldText}>{msg}</span>,
                subOrderName,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );
    case ENotificationType.SUB_ORDER_CANCELED:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.subOrderCanceled',
              },
              {
                span: (msg: any) => <span className={css.boldText}>{msg}</span>,
                subOrderName,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );
    case ENotificationType.SUB_ORDER_UPDATED:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.subOrderUpdated',
              },
              {
                span: (msg: any) => <span className={css.boldText}>{msg}</span>,
                subOrderName,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );
    case ENotificationType.SUB_ORDER_REVIEWED_BY_BOOKER:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.subOrderReviewedByBooker',
              },
              {
                span: (msg: any) => <span className={css.boldText}>{msg}</span>,
                subOrderName,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );
    case ENotificationType.BOOKER_NEW_ORDER_CREATED:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.bookerNewOrderCreated',
              },
              {
                span: (msg: any) => <span className={css.boldText}>{msg}</span>,
                orderDates,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );
    case ENotificationType.BOOKER_SUB_ORDER_COMPLETED:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.bookerSubOrderCompleted',
              },
              {
                span: (msg: any) => <span className={css.boldText}>{msg}</span>,
                subOrderDate: formattedDate,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );
    case ENotificationType.BOOKER_SUB_ORDER_CANCELLED:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.bookerSubOrderCancelled',
              },
              {
                span: (msg: any) => <span className={css.boldText}>{msg}</span>,
                subOrderDate: formattedDate,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );
    case ENotificationType.BOOKER_ORDER_CHANGED:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.bookerOrderChanged',
              },
              {
                span: (msg: any) => <span className={css.boldText}>{msg}</span>,
                orderDates,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );
    case ENotificationType.BOOKER_RATE_ORDER:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.bookerRateOrder',
              },
              {
                span: (msg: any) => <span className={css.boldText}>{msg}</span>,
                orderDates,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );
    case ENotificationType.BOOKER_PICKING_ORDER:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.bookerPickingOrder',
              },
              {
                span: (msg: any) => <span className={css.boldText}>{msg}</span>,
                orderDates,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );

    case ENotificationType.PARTNER_FOOD_ACCEPTED_BY_ADMIN:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.partnerFoodAcceptedByAdmin',
              },
              {
                span: (msg: any) => <span className={css.boldText}>{msg}</span>,
                foodName,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );

    case ENotificationType.PARTNER_FOOD_REJECTED_BY_ADMIN:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.partnerFoodRejectedByAdmin',
              },
              {
                span: (msg: any) => <span className={css.boldText}>{msg}</span>,
                foodName,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );

    case ENotificationType.PARTNER_PROFILE_UPDATED_BY_ADMIN:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.partnerProfileUpdatedByAdmin',
              },
              {
                span: (msg: any) => <span className={css.boldText}>{msg}</span>,
                partnerName,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );

    case ENotificationType.PARTNER_SUB_ORDER_CHANGED:
      return (
        <div className={css.contentWrapper}>
          <div className={css.content}>
            {intl.formatMessage(
              {
                id: 'NotificationItemInfo.title.partnerSubOrderChanged',
              },
              {
                span: (msg: any) => <span className={css.boldText}>{msg}</span>,
                subOrderName: partnerSubOrderName,
              },
            )}
          </div>
          <div className={css.pastTime}>{pastTime}</div>
        </div>
      );
    default:
      return <div></div>;
  }
};

export default NotificationItemInfo;
